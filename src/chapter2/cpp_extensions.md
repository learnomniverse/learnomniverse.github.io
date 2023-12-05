# Native C++ extensions

Having some understanding of the [repo_man build system](../chapter2/repo_man.md) is going to be highly beneficial for developing the most powerful type of Omniverse extensions: C++ native extensions. Compared to simple Python scripts extensions, these are somewhat more complicated from a build and development standpoint. Of course the upside is the performance boost that these extensions can leverage via native compiled C++ code linked directly into the Omniverse system.


```admonish tip title="GitHub Code"
<p style="display: flex; align-items: center;">
  <img src="../images/chapter2/gh_icon.png" alt="The Rust Logo" width="48px" height="48px" style="margin-right: 10px;" />
  All the code in this section is available in the public NVIDIA repository:&nbsp;<a href="https://github.com/NVIDIA-Omniverse/kit-extension-template-cpp">kit-extension-template-cpp</a>. Read on for an in-depth explanation.
</p>
```

The [kit-extension-template-cpp](https://github.com/NVIDIA-Omniverse/kit-extension-template-cpp) repository is larger than the previous sample ones because it includes all of the necessary build system scripts and files, plus several different C++ and mixed extensions to demonstrate various Omniverse technologies (including USDRT and Fabric, which we will cover later in this book).

## Dependencies

Perhaps the most important new script in the `kit-extension-template-cpp` repo is the `repo_man` invocation of the [`Repo Build`](https://docs.omniverse.nvidia.com/dev-guide/latest/dev_guide/build/build.html#repo-build) tool:

```bash
kit-extension-template-cpp$ cat ./build.sh
#!/bin/bash
set -e
SCRIPT_DIR=$(dirname ${BASH_SOURCE})
# invokes 'python tools/repoman/repoman.py build' in the current working directory through the repo.sh script
source "$SCRIPT_DIR/repo.sh" build $@ || exit $?
```

As before, as soon as `repo_man` will start, it will invoke `packman` to download all the NVIDIA CDN-provided packages listed in `deps/*.packman.xml` files. This repository will use a fair deal of Kit and its bundled extensions, plus it's meant to be used as a development repository (hence many extensions and libraries should be available to developers), therefore it doesn't pull a lightweight `kit-kernel` out of packman but rather a full-blown `Kit` package.

```bash
kit-extension-template-cpp$ cat deps/kit-sdk.packman.xml
<project toolsVersion="5.0">
  <!-- We always depend on the release kit-sdk package, regardless of config -->
  <dependency name="kit_sdk_${config}" linkPath="../_build/${platform}/${config}/kit" tags="${config} non-redist">
    <package name="kit-sdk" version="105.1+release.127680.dd92291b.tc.windows-x86_64.release" platforms="windows-x86_64" checksum="78b6054c730a44b97e6551eae9e17f45384621f244d4babde5264a1d6df3038f" />
    <package name="kit-sdk" version="105.1+release.127680.dd92291b.tc.linux-x86_64.release" platforms="linux-x86_64" checksum="2f8357eda2de9232c0b4cb345eb6c4d3c3aa8c4c9685ed45d4bfe749af57b0b8" />
  </dependency>
</project>
```

As before, the code above will pull some packman packages (verified by checksum) according to platform, configuration, etc. and create symlinks in `<repo_root>/_build/linux-x86_64/release/[symlinks_here]` to them. This will ensure that when we run a Kit application with a kit file from the scripts like `<repo_root>/_build/linux-x86_64/release/omni.app.example.extension_browser.sh` for example, it will invoke the sym-linked kit (which was downloaded in some temporary location by packman, usually indicated by the `PM_PACKAGES_ROOT` environment variable if set or otherwise defaulted to some `~/packman-repo` location) with the appropriate already-defined kit file in `<repo_root>/_build/linux-x86_64/release/apps/some_kit_file.kit`. These `.kit` files will, in turn, load as they please some/all of the the repository extensions because the same `<repo_root>/_build/linux-x86_64/release/apps` folder is, in fact, another symlink to `<repo_root>/source/apps` where we git-committed a list of `.kit` files to customize the kit-based application where we want to launch our extension in. We could have written an entire `.kit` file for a OV composer here, or just a very basic `.kit` file with our extension and the bare additional minimum to make it work, e.g.

```bash
kit-extension-template-cpp$ cat source/apps/omni.app.example.extension_browser.kit
# An application is really just an extension that depends on other extensions.

[package]
title = "Example Application: Extension Browser"
description = "An example application that runs kit with the minimal set of extensions required to use the extension browser."
keywords = ["app"] # Makes this browsable in the UI under the "experience" filter.

[dependencies]
"omni.kit.uiapp" = {}
"omni.kit.window.extensions" = {}
# Add new extensions here if you want them enabled automatically when this app is run.
# Otherwise, you can search for them in the extensions window and enable/disable them.
<---- add your repository's source/extensions/omni.whatever extension here!!! the bare minimum
uiapp/window.extensions for UI and extensions browser have already been added in the lines above ---->

[settings]
app.exts.folders.'++' = ["${app}/../exts"] # Make extensions from this repo available to kit.
app.menu.legacy_mode = false # So the extension window shows up
app.windowtitle = "Example Application: Extension Browser"
app.windowwidth = 1700
app.windowheight = 900
```

There's also another interesting file in this repo: `deps/kit-sdk-deps.packman.xml`

```bash
kit-extension-template-cpp$ cat deps/kit-sdk-deps.packman.xml
<project toolsVersion="5.0">
  <!-- Import dependencies from Kit SDK to ensure we're using the same versions. -->
  <import path="../_build/${platform}/${config}/kit/dev/all-deps.packman.xml">
    <filter include="carb_sdk_plugins"/>
    <filter include="cuda"/>
    <filter include="doctest"/>
    <filter include="pybind11"/>
    <filter include="python"/>
  </import>

  <!-- Override the link paths to point to the correct locations. -->
  <dependency name="carb_sdk_plugins" linkPath="../_build/target-deps/carb_sdk_plugins"/>
  <dependency name="cuda" linkPath="../_build/target-deps/cuda"/>
  <dependency name="doctest" linkPath="../_build/target-deps/doctest"/>
  <dependency name="pybind11" linkPath="../_build/target-deps/pybind11"/>
  <dependency name="python" linkPath="../_build/target-deps/python"/>

</project>
```

this file, compared to the `deps/kit-sdk.packman.xml`, doesn't directly declare package names for `packman` to import from whatever CDN it was configured with. But rather `import`s other dependencies from the same Kit package we downloaded and symlinked when the `deps/kit-sdk.packman.xml` file was processed (so this file gets invoked _afterwards_ by `repo_man`). Through the `filter` directive, just _some_ of the packages in that imported file get in scope (without those `filter`, all of the dependencies in that file would have been pulled). **This makes sure that our project gets the `carb_sdk_plugins`, `cuda`, etc. dependencies packages but _exactly those same versions_ which the downloaded Kit depends on.** This ensure compatibility between our native C++ code and whatever versions that pulled Kit is using. The `<dependency/>` directives below are just for fixing the symlinks to those resolved packages so they are available in `<repo_root>/_build/target-deps/[packagename]` for easier `premake` build scripts.

You can inspect the other deps files but if you've followed through here, they should be a pretty straightforward reading.

## premake5 build scripts

In `deps/host-deps.packman.xml` there's a `premake` dependency: [`premake`](https://github.com/premake/premake-core) is a build projects generator (e.g. it can generate visual studio project files and GNU makefiles) that uses the Lua scripting language in order to be quite easy to use and is known for having a less steep learning curve than other counterparts like CMake.

Omniverse extensions often uses `premake` to parse their project definition scripts and generate the project files that `repo_build` can later invoke with the right compilers to generate the binaries. This is of course usually not needed in simple Python-only based extensions, but it's necessary in C++ and hybrid extensions.

Under the hood `repo_man` invokes the `repo_build` tool that does something like

```bash
/tmp/kit-extension-template-cpp/_build/host-deps/premake/premake5 --file=/tmp/kit-extension-template-cpp/premake5.lua gmake2 --platform-host=linux-x86_64 --scripts=/home/alex/packman-repo/chk/repo_build/0.44.6/lua --verbose --solution-name=kit-extension-template-cpp --os=linux
```

to automatically add the extensions' `premake5.lua` files to be parsed. The extensions to be built should reside in `<repo_root>/source/extensions/*` - take a look at the `repo_kit_tools` tool-provided lua script `_repo/deps/repo_kit_tools/kit-template/premake5-kit.lua`:

```lua
-- Include all extensions in premake using glob (each has own premake5.lua file)
function m.autoinclude_extensions()
    for _, ext in ipairs(os.matchdirs(root.."/source/extensions/*")) do
        if os.isfile(ext.."/premake5.lua") then
            include (ext)
        end
    end
end
```

Native Makefiles (or visual studio projects) will be generated by `premake` in the internal/dev_only `_compiler/[your_build_system]` folder. For example you can inspect the generated Makefiles here. Some more information on the `premake5.lua` files can be found [here in some official docs](https://docs.omniverse.nvidia.com/kit/docs/kit-template/latest/content.html#config-files).

```admonish info
Nothing prevents a developer to write his own build scripts and/or drop `repo_man` and write his own deps/build workflow for his extensions, Omniverse makes these development tools available to streamline a comfortable and reliable development experience on a complex ecosystem which is always improving and changing. Omniverse's build system might even change in the future, but NVIDIA has always strived to provide a consistent and easy-to-use development software platform for Omniverse.
```

## Native C++ extensions structure

An Omniverse native C++ extension usually either exposes C++ methods (through pybind11 bindings) to the Python scripts which are later loaded and executed by the Kit Python runtime (this is also the preferred way of interacting with `omni.ui` and other python-based GUI frameworks), or it usually defines some [carbonite interfaces](https://docs.omniverse.nvidia.com/kit/docs/carbonite/latest/docs/CarboniteInterfaces.html) (think of them as abstractions over .dll/.so dynamic library calls for Omniverse carbonite plugins) which can be used from other extensions to use your extension's functionalities. Typical example: the mixed core extension `omni.ext` has C++ classes compiled into binaries that you download via `carb_sdk` dependency

```bash
# example path for compiled omni.ext
/home/alex/packman-repo/chk/carb_sdk+plugins.linux-x86_64/150.11+release150.tc9105.e71ee788/..
_build/linux-x86_64/release/libomni.ext.plugin.so
```
and also ships C++ headers exposing carbonite interfaces which you can consume from your C++ Omniverse extensions

```bash
# header for omni.ext
/home/alex/packman-repo/chk/carb_sdk+plugins.linux-x86_64/150.11+release150.tc9105.e71ee788/..
include/omni/ext/IExt.h
```

together with Python bindings that you can load and call from your Python scripts

```bash
# this allows you to import omni.ext in python
/home/alex/packman-repo/chk/carb_sdk+plugins.linux-x86_64/150.11+release150.tc9105.e71ee788/..
_build/linux-x86_64/release/bindings-python/omni/ext/_extensions.cpython-310-x86_64-linux-gnu.so
```

of course a C++ native extension could as well do neither of the above, but most native or hybrid extensions in Omniverse do.

Recall from [chapter1](../chapter1/kit_applications.md) that extensions are also carbonite plugins (which is a lower level definition independent from Kit - just relying on the Carbonite SDK). This explains why Omniverse extensions usually expose Carbonite interfaces or implement these low-level C-like interfaces and why C++ native files sit in a `plugins` folder in a typical native extension directory structure. Here's an example:

```
kit-extension-template-cpp/
├─ source/
   ├─ extensions/
      ├─ omni.example.cpp.hello_world/
         ├─ config/ // the 'extension.toml' file lives here. Tokens, which python modules and which C++ plugins
         |          // are exposed by this extension is specified here along with some copyright, title, UI info
         |          // for the Omniverse Extensions Browser GUI as well.
         ├─ data/ // Binary data for the extension
         ├─ docs/ // Documentation and Changelog for the extension
         ├─ omni/example/cpp/hello_world/ // Hierarchy of folders with the same extension name with the Python files
         |  ├─ __init.py__ // startup init for the python module
         |  ├─ scripts/ // Python scripts exposing python stuff
         ├─ plugins/ // This is where C++ code lives: these are where the C++ carbonite plugins live
         |  ├─ omni.example.cpp.hello_world/
         |     ├─ SomeCppFileImplementingCarboniteInterface.cpp
         ├─ premake5.lua // Building premake script using repo_kit_tools exposed methods and facilities
```

Inside the `config/extension.toml` there's also something important:

```bash
kit-extension-template-cpp$ cat source/extensions/omni.example.cpp.hello_world/config/extension.toml
[package]
version = "1.0.0" # Semantic Versioning is used: https://semver.org/

# These fields are used primarily for display in the extension browser UI.
title = "Example C++ Extension: Hello World"
... truncated ...

# Define the Python modules that this extension provides.
# C++ only extensions need this just so tests don't fail.
[[python.module]]
name = "omni.example.cpp.hello_world"

# Define the C++ plugins that this extension provides.
[[native.plugin]]
path = "bin/*.plugin"
```

i.e. the python module directory (from the extension **build folder**) and where the carbonite plugin-interfaces C++ files are contained (again from the extension **build folder**).

[Read the 'Extensions In-Depth' official docs](https://docs.omniverse.nvidia.com/kit/docs/kit-manual/latest/guide/extensions_advanced.html) for more information on this topic.

To understand why we're looking for python modules in that directory and for native carbonite plugins in the `bin/*.plugin`, let's take a look under `_build` at how the final folder structure for the **compiled** native extension looks like:

```bash
# Note that we're already in _build
/tmp/kit-extension-template-cpp/_build$ ll ./linux-x86_64/release/exts/omni.example.cpp.hello_world
total 32
drwxr-xr-x  4 alex alex 4096 dic  5 16:28 ./
drwxr-xr-x 15 alex alex 4096 dic  5 16:28 ../
drwxr-xr-x  2 alex alex 4096 dic  5 16:28 bin/
lrwxrwxrwx  1 alex alex   85 dic  5 16:28 config -> /tmp/kit-extension-template-cpp/source/extensions/omni.example.cpp.hello_world/config/
lrwxrwxrwx  1 alex alex   83 dic  5 16:28 data -> /tmp/kit-extension-template-cpp/source/extensions/omni.example.cpp.hello_world/data/
lrwxrwxrwx  1 alex alex   83 dic  5 16:28 docs -> /tmp/kit-extension-template-cpp/source/extensions/omni.example.cpp.hello_world/docs/
lrwxrwxrwx  1 alex alex   83 dic  5 16:28 omni -> /tmp/kit-extension-template-cpp/source/extensions/omni.example.cpp.hello_world/omni/
drwxr-xr-x  2 alex alex 4096 dic  5 16:28 PACKAGE-LICENSES/
/tmp/kit-extension-template-cpp/_build$ ll ./linux-x86_64/release/exts/omni.example.cpp.hello_world/bin
total 616
drwxr-xr-x 2 alex alex   4096 dic  5 16:28 ./
drwxr-xr-x 4 alex alex   4096 dic  5 16:28 ../
-rwxr-xr-x 1 alex alex 620288 dic  5 16:28 libomni.example.cpp.hello_world.plugin.so*
/tmp/kit-extension-template-cpp/_build$ ll ./linux-x86_64/release/exts/omni.example.cpp.hello_world/omni/example/cpp/hello_world/
total 12
drwxrwxr-x 2 alex alex 4096 dic  5 10:23 ./
drwxrwxr-x 3 alex alex 4096 dic  5 10:23 ../
-rw-rw-r-- 1 alex alex  480 dic  5 10:23 __init__.py
/tmp/kit-extension-template-cpp/_build$
```

This final-built folder structure was created through symlinks to original source config files and binary directories (binaries and everything build-system-generated are _never_ stored on the original `source/` directories so they can be committed into git or whatever version control you're using) is created by the `repo_kit_tools` premake5 lua scripts when `source/extensions/omni.example.cpp.hello_world` is run

```bash
/tmp/kit-extension-template-cpp$ cat source/extensions/omni.example.cpp.hello_world/premake5.lua
```
```lua
-- Setup the extension. This uses repo_kit_tools facilities to gather this very same extension's data and paths
-- (if you respected the folder structure, of course)
local ext = get_current_extension_info()
project_ext(ext)

-- Create symlinks in the final build directory for folders that should be packaged with the extension
-- (and usually committed in git)
repo_build.prebuild_link {
    { "data", ext.target_dir.."/data" },
    { "docs", ext.target_dir.."/docs" },
    { "omni", ext.target_dir.."/omni" },
}

-- Build the C++ plugin that will be loaded by the extension. By convention it should have name
-- omni.whatever.extension_name.plugin
-- A carbonite plugin must also implement the omni::ext::IExt interface if it's meant to be
-- automatically loaded by the extension system at startup.
-- This will also create the final folder structure automatically.
project_ext_plugin(ext, "omni.example.cpp.hello_world.plugin")
    local plugin_name = "omni.example.cpp.hello_world"
    add_files("source", "plugins/"..plugin_name)
    includedirs { "plugins/"..plugin_name }
```

This is a very simple `premake5.lua` build script but it demonstrates the power of the Omniverse build tools framework: if we abide by the expected folder structure, most of the things we need to worry about can be safely ignored or taken for granted - the build system will take care of them for us and provide an easier Omniverse development experience.

## C++ code for native extensions

A C++ extension might expose any number of Carbonite plugin interfaces for others to consume. In mixed/hybrid C++ and Python extensions, one would usually write python code to startup the extension:

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

the same if the extension is just a simple Python-only extension: you would have a class deriving from `omni.ext.IExt` in python that acts as entrypoint for the Kit extensions system. C++ source code in this case would only expose some carbonite plugin interfaces that can be invoked by the python code through pybind11 bindings.

If you have a C++ carbonite plugin (remember that this is a lower level than Kit) and you want to turn it into a **native-only Kit extension**, i.e. **without any python code whatsoever in the Kit extension**, you can avoid python altogether by using a specially-added carbonite interface: `omni::ext::IExt`. This interface is defined as a C++ class with some pure methods that a derived class is supposed to reimplement (much like the `class ExampleMixedExtension(omni.ext.IExt)` python code above but in C++) and that is not meant to be exported to other plugins.


This is how the `omni.example.cpp.hello_world` C++-only native-only from-carbonite-plugin-to-kit-extension work in the `kit-extension-template-cpp` repository: the code defines a C++ class derived from `omni::ext::IExt` (`omni::ext::IExt` being the new carbonite _COM-like_ interface that gets implemented in the `hello_world` plugin) and the key parts that need to be available for generating the translation unit boilerplate needed by the carbonite system are the following:

```cpp
#define CARB_EXPORTS

#include <carb/PluginUtils.h>

#include <omni/ext/IExt.h>
#include <omni/kit/IApp.h>

// A PID - Plugin Implementation Descriptor for this plugin
const struct carb::PluginImplDesc pluginImplDesc = { "omni.example.cpp.hello_world.plugin",
                                                     "An example C++ extension.", "NVIDIA",
                                                     carb::PluginHotReload::eEnabled, "dev" };

// The carbonite plugin implementation DEPENDENCIES. These are the carbonite interfaces that
// this plugin depends on and that it would like to be available. This macro generates the correct
// carbonite boilerplate code to be later able to do something like
//    omni::kit::IApp* app = carb::getFramework()->acquireInterface<omni::kit::IApp>();
// see https://docs.omniverse.nvidia.com/kit/docs/carbonite/latest/docs/CarboniteInterfaces.html
CARB_PLUGIN_IMPL_DEPS(omni::kit::IApp)

// some namespaces for your symbols..
namespace omni
{
  namespace example
  {
    namespace cpp
    {
      namespace hello_world
      {

        // When this extension is enabled, any class that derives from omni.ext.IExt
        // will be instantiated and 'onStartup(extId)' called. When the extension is
        // later disabled, a matching 'onShutdown()' call will be made on the object.
        // omni::ext::IExt is a carbonite interface and it has a CARB_PLUGIN_INTERFACE()
        // macro inside its definition:
        //
        // class IExt {
        // public:
        //     CARB_PLUGIN_INTERFACE("omni::ext::IExt", 0, 1); <--- versioned interface
        //     virtual void onStartup(const char* extId) = 0; // to be implemented somewhere else
        class ExampleCppHelloWorldExtension : public omni::ext::IExt
        {
        public:
          // These HAVE to be implemented because IExt has pure virtuals for these..
            void onStartup(const char* extId) override {
                printf("ExampleCppHelloWorldExtension starting up (ext_id: %s).\n", extId);

                // Get the app interface from the Carbonite Framework, this is made possible by the CARB_PLUGIN_IMPL_DEPS
                if (omni::kit::IApp* app = carb::getFramework()->acquireInterface<omni::kit::IApp>()) {
                  // etc..
                }
            }

            void onShutdown() override {
                printf("ExampleCppHelloWorldExtension shutting down.\n");
                // ..
            }

            // ..

        private:
            // ..
        };
      }
    }
  }
}

// The interfaces that this plugin IMPLEMENTS. These can also be derived classes of abstract interfaces.
CARB_PLUGIN_IMPL(pluginImplDesc, omni::example::cpp::hello_world::ExampleCppHelloWorldExtension)

// This is empty but also important: this symbol NEEDS to be defined. This routine usually serves for populating
// a carbonite interface, but as we said IExt is special and it's just a machinery to avoid python for native-only
// C++ extensions
void fillInterface(omni::example::cpp::hello_world::ExampleCppHelloWorldExtension& iface) {
  // you can also use CARB_UNUSED(iface) here
}
```

It is highly recommended to take a look at the nicely commented header files code in `carb_sdk.whatever/include/carb/PluginUtils.h` and other headers in that directory for more information.

```admonish note
There's also another project going on at Carbonite to implement [`Omniverse Native Interfaces`](https://docs.omniverse.nvidia.com/kit/docs/carbonite/latest/docs/OniWalkthrough.html) that would address some of the standard carbonite interfaces drawbacks, but it's still a beta project being worked on so we won't focus on it yet.
```

This is a common and practical way to create a native-only C++-only Kit extension (directly from a Carbonite plugin) without writing a single line of Python code. All the facilities needed to link the right Carbonite libraries and set up the build tools are provided by the `premake5.lua` project definitions.

## Carbonite plugins which are NOT Omniverse Kit extensions

It goes without saying that one can also write a Carbonite plugin which is _not_ a Kit extension by writing parts of that same boilerplate generated by `CARB_PLUGIN_IMPL` when a class derived from `omni::ext::IExt` is passed to it:

`plugins/MyCarboniteInterface.h`
```cpp
#pragma once

#include <carb/Types.h>

namespace omni {
  namespace custom {
    struct IMyCarboniteInterface {
      CARB_PLUGIN_INTERFACE("my_custom_plugin::IMyCarboniteInterface", 0, 1);

      void(CARB_ABI* some_method_to_print_stuff_from_my_cpp_code)();
    };
  }
}
```

`plugins/MyCustomPlugin.cpp`
```cpp
#define CARB_EXPORTS

#include "MyCarboniteInterface.h"

const struct carb::PluginImplDesc kPluginImpl = { "omni.custom.plugin", "MyCustomPlugin", "Alex",
                                                  carb::PluginHotReload::eDisabled, "dev" };

CARB_PLUGIN_IMPL(kPluginImpl, omni::my::custom::plugin::IMyCarboniteInterface)
CARB_PLUGIN_IMPL_DEPS(/* any other carbonite interface this plugin might depend on */);

namespace omni {
  namespace custom {

    MyCustomClass *someGlobalHere = nullptr;

    void internal_implementation_of_some_method_to_print_stuff() {
      CARB_LOG_WARN("hello world!");
      someGlobalHere->some_more_complicated_stateful_logic();
    }
  }
}

// Populates the 'jumptable' towards our internal methods in this same translation unit code.
// This will be invoked when this carbonite plugin will be loaded so other carbonite plugins can use it.
void fillInterface(omni::custom::IMyCarboniteInterface& iface) {
  using namespace omni::custom::IMyCarboniteInterface;
  iface.some_method_to_print_stuff_from_my_cpp_code = internal_implementation_of_some_method_to_print_stuff;
}

// Carbonite plugin startup routine - called when the carbonite plugin is loaded for the first time
CARB_EXPORT void carbOnPluginStartup() {
  // in a not-so-recommended C-like fashion, global variables might even be initialized here..
  someGlobalHere = ...;
}
CARB_EXPORT void carbOnPluginShutdown() {
  // destroy someGlobalHere..
}
```

The code above is a lower level carbonite plugin and **not** Omniverse extension: you won't be able to load it as a Kit extension.It uses low-level Carbonite entrypoints (`carbOnPluginStartup` and `carbOnPluginShutdown`) and shows a classic Carbonite way of populating Carbonite interfaces with the `fillInterface()` method (which **must** be defined).

In general: if you use carbonite function pointers in your interface:
```cpp
struct IMyCarboniteInterface {
      CARB_PLUGIN_INTERFACE("my_custom_plugin::IMyCarboniteInterface", 0, 1);

      void(CARB_ABI* some_method_to_print_stuff_from_my_cpp_code)();
    };
```
you should populate them at `fillInterface()` time or callers will erroneously call unbound methods.
If you define carbonite interfaces as base classes with pure virtual calls:
```cpp
class IExampleUsdInterface {
public:
    CARB_PLUGIN_INTERFACE("omni::example::cpp::usd::IExampleUsdInterface", 1, 0);

    virtual void createPrims() = 0; // Create some example prim in the current USD context using C++
};
```
(just like the previous example with `omni::ext::IExt` does), then you should subclass that class and implement the required methods. And the `fillInterface()` symbol must be defined but the function can be empty:
```cpp
class ExampleCppUsdExtension : public IExampleUsdInterface {
public:
  void createPrims() override {
    // whatever
  }
}
CARB_PLUGIN_IMPL(pluginImplDesc, omni::example::cpp::usd::ExampleCppUsdExtension)
void fillInterface(omni::example::cpp::usd::ExampleCppUsdExtension& iface)
{
}
```

This is valid for any Carbonite plugin (not considering the beta ONI interfaces).