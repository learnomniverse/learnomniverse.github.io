# Python Extensions

```admonish tip title="GitHub Code"
<p style="display: flex; align-items: center;">
  <img src="../images/chapter2/gh_icon.png" alt="The Rust Logo" width="48px" height="48px" style="margin-right: 10px;" />
  All the code in this section is available in public NVIDIA repositories:
  <ul>
    <li><a href="https://github.com/NVIDIA-Omniverse/kit-extension-template">kit-extension-template</a></li>
    <li><a href="https://github.com/NVIDIA-Omniverse/kit-project-template">kit-project-template</a></li>
  </ul>
  Read on to know the differences and which one you should use for your first extension.
</p>
```

Starting developing a Python-only Omniverse extension is quite easy compared to native or mixed extensions and allows you to experiment immediately with the full power of Omniverse.

As [we already said before](../chapter1/kit_applications.md) Python scripts (and an extension is no different) can be executed in Omniverse as long as the Python carbonite plugin is available. This means that there must be a Kit instance somewhere to run a Python extension.

The main difference between the [NVIDIA-Omniverse/kit-extension-template](https://github.com/NVIDIA-Omniverse/kit-extension-template) repo and the [NVIDIA-Omniverse/kit-project-template](https://github.com/NVIDIA-Omniverse/kit-project-template) is exactly how the sample python extension gets to execute in a Kit instance:

## kit-extension-template

In [`kit-extension-template`](https://github.com/NVIDIA-Omniverse/kit-extension-template) two simple scripts (a `.bat` for Windows platforms and a `.sh` for unix platforms) are provided to look for locally installed Kit applications: be it OV Composer, OV Presenter, OV Code or something else.

As the `README.md` mentions, the Omniverse Launcher must be installed and at least one Omniverse Kit-based app should be installed. As [we've already seen](../chapter1/kit_applications.md) OV Launcher keeps a local port open to answer `GET` requests and provide the locally installed path of the omniverse kit-based applications. Executing `link_app` will call some platform-specific scripts developed by NVIDIA in the `tools` directory (this is a very common directory in OV extensions) and eventually execute the following actions:

* install python if not yet available (downloaded from a NVIDIA CDN)
* install [packman](https://docs.omniverse.nvidia.com/kit/docs/carbonite/latest/docs/Packaging.html) which is a NVIDIA-maintained CDN and package manager which ensures Omniverse extensions and projects always have their dependencies available. Most Omniverse projects use `packman` under the hood and its utility scripts often live in a `tools/packman` subdirectory.
* determines where downloaded packages are to be stored on disk (`PM_PACKAGES_ROOT`, by default `$HOME/packman-repo`)
* ensures existence of `7za` for package decompression
* calls some python scripts (`tools/scripts`) to look for omniverse installed apps through the running launcher
* create a soft symbolic link (linux) or symlink (windows) to the Kit-based app directory, so the `kit` executable can be referenced through it

Here's a sample run

```bash
$ git clone git@github.com:NVIDIA-Omniverse/kit-extension-template.git
# make sure OV launcher is running and OV Composer or any other kit-based app is installed
$ ./link_app.sh
Path is not specified, looking for Omniverse Apps...

Found following Omniverse Apps:
0: Nucleus Workstation (nucleus-workstation) at: '/home/alex/.local/share/ov/pkg/nucleus-workstation-2023.2.0'
1: Cache (cache) at: '/home/alex/.local/share/ov/pkg/cache-2023.2.0-rc.3'
2: USD Composer (create) at: '/home/alex/.local/share/ov/pkg/create-2023.3.0'

Selected app: nucleus-workstation
Creating a link '/tmp/kit-extension-template/tools/scripts/../../app' -> '/home/alex/.local/share/ov/pkg/nucleus-workstation-2023.2.0'
# Nope, nucleus won't do it because it doesn't have a `kit/kit` folder inside, not a kit-based app...
# let's pick another one
$ ./link_app.sh --app create # remember that OV Composer was formerly called Create
Path is not specified, looking for Omniverse Apps...

Found following Omniverse Apps:
0: Nucleus Workstation (nucleus-workstation) at: '/home/alex/.local/share/ov/pkg/nucleus-workstation-2023.2.0'
1: Cache (cache) at: '/home/alex/.local/share/ov/pkg/cache-2023.2.0'
2: USD Composer (create) at: '/home/alex/.local/share/ov/pkg/create-daily-2023.3.0'

Selected app: create
Creating a link '/tmp/kit-extension-template/tools/scripts/../../app' -> '/home/alex/.local/share/ov/pkg/create-2023.3.0'
packman(WARNING): Path '/tmp/kit-extension-template/tools/scripts/../../app' exists but is incorrect. Removing ...
Success!
```

At this point we can either do something like `./app/kit/kit --ext-folder ./exts --enable omni.hello.world` or, if we want to run our sample extension along with other (almost 300) OV extensions in a full instance of OV Composer, we can use

```bash
$ ./app/omni.create.sh --ext-folder exts --enable omni.hello.world
```

note that in the same directory as the `omni.create.sh` script there are usually many other options like `omni.create.singlegpu.sh` to run OV composer in single-gpu mode, `omni.create.hdstorm.sh` to use the non-RTX OpenGL renderer, etc.. these scripts launch `./kit/kit` with different settings and/or `.kit` files (`.kit` files are usually stored in the `./apps` directory for convention, you can take a look at those there as well).

The process above can similarly be accomplished in the OV Composer `Tools->Extensions` browser UI

![](../images/chapter2/extension_browser.png)

the Extensions Browser is also an extension itself (so it won't be available unless the kit app has the owning extension `omni.kit.window.extensions` defined in its `.kit` file or loads it manually with `--ext-folder` and `--enable` parameters).


## kit-project-template

The [`kit-project-template`](https://github.com/NVIDIA-Omniverse/kit-project-template) is more geared towards developing "projects" rather than extensions, i.e. extensions 'packaged' with all the necessary kit kernel to be e.g. zipped, sent to a user, extracted and (hopefully) work out of the box on an Omniverse capable RTX system.



TODO








--------------------

start from https://docs.omniverse.nvidia.com/dev-guide/latest/dev_guide/build/build.html ..
py is easy. Just show the structure and provide a simple link to github extension in this same book or (better) within the same github org.

link_app.sh from https://github.com/NVIDIA-Omniverse/kit-extension-template.
If you want, introduce kit kernel (very lightweight, say that whatever needed downloaded from registry) and show from kitk (vedi sotto) the .kit with

```
[package]
title = "My Simple Application"

version = "1.0.0"

description = """This Simple application shows you how to make an application"""

# Keywords make  it browseable in UI using the "experience" filter
keywords = ["app"]

[dependencies]
# Create Kit UI Based applications
"omni.app.mini" = {} # or full

"omni.hello.world" = {}
```

show packaging as well
https://docs.omniverse.nvidia.com/dev-guide/latest/dev_guide/package/package.html


two words on publishing
https://docs.omniverse.nvidia.com/dev-guide/latest/dev_guide/publish/publish.html



------- resources ---

old: https://github.com/NVIDIA-Omniverse/kit-extension-template
new: https://github.com/NVIDIA-Omniverse/kit-extension-template-cpp/
wip: omniverse/kit-github/kit-project-template (kitk)
https://github.com/NVIDIA-Omniverse/kit-project-template
https://docs.omniverse.nvidia.com/kit/docs/point-cloud-import/latest/build_tools.html
https://docs.omniverse.nvidia.com/dev-guide/latest/dev_guide/build/build.html#repo-build
http://omniverse-docs.s3-website-us-east-1.amazonaws.com/repo_man/1.50.2/docs/notable_tools.html

https://docs.omniverse.nvidia.com/kit/docs/kit-app-template/latest/commands.html

 premake, etc.

simple hello world

show that you can load an extension individually (hello world only, no viewport), explain folder structure of most kit-based app distros, explain symlinks, etc.


native (can this be shown?)

mixed exts