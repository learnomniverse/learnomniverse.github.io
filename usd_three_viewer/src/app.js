import WebGL from 'three/examples/jsm/capabilities/WebGL.js';
import { Viewer } from './viewer.js';
import { Validator } from './validator.js';
import queryString from 'query-string';

window.VIEWER = {};

if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
    console.error('The File APIs are not fully supported in this browser.');
} else if (!WebGL.isWebGLAvailable()) {
    console.error('WebGL is not supported in this browser.');
}

// Wait for the document to fully load and add a book cover title page
document.addEventListener('DOMContentLoaded', function () {

    if (location.href.includes("print.html")) {
        // Remove 'overflow: hidden' from the body element or we won't be able to print the entire doc
        document.body.style.overflow = 'visible';

        // Create a div for the book cover title page
        var titlePageDiv = document.createElement('div');
        titlePageDiv.style.textAlign = 'center';
        titlePageDiv.style.marginTop = '50px';

        // Add a book title
        var bookTitle = document.createElement('h1');
        bookTitle.textContent = 'Learn OpenUSD';
        bookTitle.style.fontFamily = 'Arial, sans-serif';
        bookTitle.style.fontSize = '32px';
        titlePageDiv.appendChild(bookTitle);

        // Add a subtitle
        var subtitle = document.createElement('p');
        subtitle.textContent = 'Written by Marco Alesiani';
        subtitle.style.fontFamily = 'Arial, sans-serif';
        subtitle.style.fontSize = '18px';
        subtitle.style.color = 'gray';
        titlePageDiv.appendChild(subtitle);

        // Clear any existing content (this is the webgl viewer only, not the rest of the pages)
        var mainContentDiv = document.getElementById('main-content');
        if (mainContentDiv) {
            while (mainContentDiv.firstChild) {
                mainContentDiv.removeChild(mainContentDiv.firstChild);
            }

            // Append the title page div to the main content div
            mainContentDiv.appendChild(titlePageDiv);
        } else {
            // The element doesn't exist in the current document
            console.log('Element with id "main-content" not found.');
        }


        // Since our visualization CSS screw with the page visualizatin, we'll fix
        // some CSS rules here with !important
        var bodyElement = document.body;
        bodyElement.style.setProperty('display', 'block', 'important');
        bodyElement.style.setProperty('overflow', 'auto', 'important');
        bodyElement.style.setProperty('width', 'auto', 'important');
        bodyElement.style.setProperty('height', 'auto', 'important');


        // Set a 'PRINTING FORMAT' label on the page

        // Create a <style> element
        var style = document.createElement("style");
        // Set the type attribute
        style.type = "text/css";
        // Set the CSS code as the innerHTML of the <style> element (background AND unclickable)
        style.innerHTML = `
.diagonal-text {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none; /* make the element unclickable */
    opacity: 0.5; /* make the element transparent */
}


.diagonal-text span {
  font-size: 8rem;
  font-weight: bold;
  color: white;
  transform: rotate(-45deg);
}

@media print {
  .noprint {
    display: none;
  }
}
`;
        // Append the <style> element to the <head> element
        document.head.appendChild(style);
        // Create a <div> element with class "diagonal-text" and "noprint"
        var div = document.createElement("div");
        div.className = "diagonal-text noprint";
        // Create a <span> element with the text "PRINTING PREVIEW"
        var span = document.createElement("span");
        span.textContent = "PRINTING FORMAT";
        // Append the <span> element to the <div> element
        div.appendChild(span);
        // Append the <div> element to the <body> element
        document.body.appendChild(div);

    }
});


class App {

    /**
     * @param  {Element} el
     * @param  {Location} location
     */
    constructor(el, location) {

        if (location.href.endsWith("print.html")) {
            return; // Do not initialize anything webgl-related
        }

        const hash = location.hash ? queryString.parse(location.hash) : {};
        this.options = {
            kiosk: Boolean(hash.kiosk),
            model: hash.model || '',
            preset: hash.preset || '',
            cameraPosition: hash.cameraPosition
                ? hash.cameraPosition.split(',').map(Number)
                : null
        };

        this.el = el;
        this.viewer = null;
        this.viewerEl = null;
        this.spinnerEl = el.querySelector('.spinner');
        this.viewZoneEl = el.querySelector('.viewzone');
        this.inputEl = el.querySelector('#file-input');
        this.validator = new Validator(el);

        // this.createDropzone();
        this.hideSpinner();

        const options = this.options;

        if (options.kiosk) {
            const headerEl = document.querySelector('header');
            headerEl.style.display = 'none';
        }

        if (options.model) {
            this.view(options.model, '', new Map());
        }

        // Replace 'your-binary-file.bin' with the actual filename of your binary file
        const fileName = 'usd_logo.glb';
        const fileUrl = './assets/../' + fileName; // Assuming the file is in the same directory as your HTML file

        // Fetch the binary file
        this.showSpinner();
        fetch(fileUrl)
            .then(response => response.blob())
            .then(blob => {
                // Create a File object from the blob
                const file = new File([blob], fileName);

                // Create a Map object with the file
                const fileMap = new Map();
                fileMap.set('usd_logo.glb', file);

                // Call the load function with the fileMap
                this.load(fileMap);
            })
            .catch(error => {
                console.error('Error loading the binary file:', error);
            });

    }

    /**
     * Sets up the view manager.
     * @return {Viewer}
     */
    createViewer() {
        this.viewerEl = document.createElement('div');
        this.viewerEl.classList.add('viewer');
        this.viewZoneEl.innerHTML = '';
        this.viewZoneEl.appendChild(this.viewerEl);
        this.viewer = new Viewer(this.viewerEl, this.options);
        return this.viewer;
    }

    /**
     * Loads a fileset provided by user action.
     * @param  {Map<string, File>} fileMap
     */
    load(fileMap) {
        let rootFile;
        let rootPath;
        Array.from(fileMap).forEach(([path, file]) => {
            if (file.name.match(/\.(gltf|glb)$/)) {
                rootFile = file;
                rootPath = path.replace(file.name, '');
            }
        });

        if (!rootFile) {
            this.onError('No .gltf or .glb asset found.');
        }

        this.view(rootFile, rootPath, fileMap);
    }

    /**
     * Passes a model to the viewer, given file and resources.
     * @param  {File|string} rootFile
     * @param  {string} rootPath
     * @param  {Map<string, File>} fileMap
     */
    view(rootFile, rootPath, fileMap) {

        if (this.viewer) this.viewer.clear();

        const viewer = this.viewer || this.createViewer();

        const fileURL = typeof rootFile === 'string'
            ? rootFile
            : URL.createObjectURL(rootFile);

        const cleanup = () => {
            this.hideSpinner();
            if (typeof rootFile === 'object') URL.revokeObjectURL(fileURL);
        };

        viewer
            .load(fileURL, rootPath, fileMap)
            .catch((e) => this.onError(e))
            .then((gltf) => {
                // TODO: GLTFLoader parsing can fail on invalid files. Ideally,
                // we could run the validator either way.
                // if (!this.options.kiosk) {
                //     this.validator.validate(fileURL, rootPath, fileMap, gltf);
                // }
                cleanup();
            });
    }

    /**
     * @param  {Error} error
     */
    onError(error) {
        let message = (error || {}).message || error.toString();
        if (message.match(/ProgressEvent/)) {
            message = 'Unable to retrieve this file. Check JS console and browser network tab.';
        } else if (message.match(/Unexpected token/)) {
            message = `Unable to parse file content. Verify that this file is valid. Error: "${message}"`;
        } else if (error && error.target && error.target instanceof Image) {
            message = 'Missing texture: ' + error.target.src.split('/').pop();
        }
        window.alert(message);
        console.error(error);
    }

    showSpinner() {
        this.spinnerEl.style.display = '';
    }

    hideSpinner() {
        this.spinnerEl.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {

    const app = new App(document.body, location);

    window.VIEWER.app = app;

    // console.info('[glTF Viewer] Debugging data exported as `window.VIEWER`.');

});
