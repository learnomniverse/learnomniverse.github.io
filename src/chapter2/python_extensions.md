
# Python Extensions

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
https://docs.omniverse.nvidia.com/kit/docs/point-cloud-import/latest/build_tools.html
https://docs.omniverse.nvidia.com/dev-guide/latest/dev_guide/build/build.html#repo-build
http://omniverse-docs.s3-website-us-east-1.amazonaws.com/repo_man/1.50.2/docs/notable_tools.html

https://docs.omniverse.nvidia.com/kit/docs/kit-app-template/latest/commands.html

 premake, etc.

simple hello world

show that you can load an extension individually (hello world only, no viewport), explain folder structure of most kit-based app distros, explain symlinks, etc.


native (can this be shown?)

mixed exts