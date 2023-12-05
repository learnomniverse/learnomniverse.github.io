# Mixed/Hybrid Omniverse C++ and Python extensions

```admonish tip title="GitHub Code"
<p style="display: flex; align-items: center;">
  <img src="../images/chapter2/gh_icon.png" alt="The Rust Logo" width="48px" height="48px" style="margin-right: 10px;" />
  All the code in this section is available in the public NVIDIA repository:&nbsp;<a href="https://github.com/NVIDIA-Omniverse/kit-extension-template-cpp">kit-extension-template-cpp</a>. Read on for an in-depth explanation.
</p>
```

When you have Python and C++ mixed (sometimes referred as _hybrid_) Omniverse extensions, the extension manager usually works with Python object returned from a `get_extensions()`: that's why in the `omni.example.cpp.pybind` extension of the sample repo `kit-extension-template-cpp` the extension entry point is in the Python scripts:

```py
# This is usually in a file in the scripts/ folder
import omni.ext

class ExampleMixedExtension(omni.ext.IExt): # entry point for the extension
    def __init__(self):
        super().__init__()
        # here one can also call C++ methods from the pybind11 bindings of this same extension (see folder bindings/)

    def on_shutdown(self):
        pass
```

from the Python code the extension can execute other Python code and also invoke the Carbonite framework and Carbonite plugins. As we've already said in the [previous section](../chapter2/cpp_extensions.md), the Carbonite `omni::ext::IExt` interface is instead a special type of Carbonite interface that allows the Carbonite plugin to be registered as a Kit extension (i.e. something of a higher object that can be used by the Kit extensions system).


// TODO explain cpp.pybind and maybe cpp.usd




--------------------

https://docs.omniverse.nvidia.com/dev-guide/latest/dev_guide/package/package.html


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