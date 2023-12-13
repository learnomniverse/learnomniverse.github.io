# A mixed(hybrid) extension based on Conan and CMake

```admonish tip title="GitHub Code"
<p style="display: flex; align-items: center;">
  <img src="../images/chapter2/gh_icon.png" alt="The GitHub Logo" width="48px" height="48px" style="margin-right: 10px;" />
  All the code in this section is available in this book's repository:&nbsp;<a href="https://github.com/learnomniverse/conan_cmake_template">conan_cmake_template</a>. Read on for an in-depth explanation.
</p>
```

Let's now present an alternate way of developing C++/Python Omniverse extensions by leveraging [Conan](https://conan.io/) for dependency management and [CMake](https://cmake.org/) as build system.

```admonish warning title="This is a Proof of Concept!"
`ov_utils` and the Conan recipes for OV binary packages are to be considered a **Proof-Of-Concept project**!
There will be libraries missing, wrong include paths and many more issues that you should be aware of. Pull requests are welcome to update packages, fixup paths and add advanced functionalities for others to include in their OV extensions!
```

The bulk of our extension will reside in the `omni.hello.world/` folder:

```
conan_cmake_template/
├─ omni.hello.world/
    ├─ bindings/ // C++ pybind11 Python bindings code resides here
    |   ├─ ExampleBindings.cpp
    ├─ config/ // the 'extension.toml' file lives here.
    ├─ data/ // icon.png, preview.png
    ├─ docs/ // changelog, readme
    ├─ include/ // Shared headers between bindings/ and plugins/
    |   ├─ omni
    |       ├─ hello
    |           ├─ world
    |               ├─ IExampleCarbInterface.h
    ├─ plugins/ // Native C++ code
    |   ├─ ExampleExtension.cpp
    ├─ python/ // Python module
        ├─ scripts/
        |   ├─ hello_world_extension.py
        ├─ __init__.py
```

If you've read through the previous sections this structure should be pretty familiar: we have a [Carbonite](../chapter1/kit_applications.md) C++ plugin built in `plugins/` that will link against the `carb_sdk` dependency downloaded as a collection of binaries and installed locally from a `ov_utils/deps/carb_sdk` Conan recipe.
Then there's a Python module (the main Python module of the extension) residing in `python/` whose main logic sits in `hello_world_extension.py` (`__init__.py` is for the module startup). These python scripts don't need any building, just that their final deployment folder structure matches the `[[python.module]]` directive in the `config/extension.toml` file

```toml
# Define the Python modules that this extension provides.
# C++ only extensions need this just so tests don't fail.
[[python.module]]
name = "omni.hello.world"

# Define the C++ plugins that this extension provides.
[[native.plugin]]
path = "bin/*.plugin"
```

i.e. that the folder structure that will be created in the `_build/` folder (where we put the build process final artifacts and simulate a fully-deployed Kit-app installation path as well) will have a `<extension_root>/omni/hello/world` folder structure where the python module's `__init.py__` will reside.

The `bindings/` folder contains the Pybind11 code to create [C++ python bindings](../chapter2/mixed_extensions.md): The `ExampleBindings.cpp` file shares the header defined in the `include/` folder to know which Carbonite interface the generated binding library should use to call into the native C++ Carbonite plugin. There will be two binary artifacts from this process: a shared library generated from the native C++ code of the extension (`plugins/`) residing in `_build/your_platform/release/exts/omni.hello.world/bin` (and specified in the `config/extension.toml` in the `[[native.plugin]]` directive) and a binding library generated from pybind11 C++ code (sitting in `_build/your_platform/release/exts/omni.hello.world/omni/hello/world/bindings` which is just a symlink to let the `hello_world_extension.py` python script find it with the relative path `from ..bindings._example_carb_bindings import *`). Both are native code architecture-specific and OS-specific so if you plan or distributing your extension to other users you should make sure to ship an appropriate version of these binaries.

The native C++ Carbon plugin uses exactly the same [pattern seen before](../chapter2/cpp_extensions.md) for the Carbonite interface, with some added code taken from the official samples to adapted to print whatever's on the current USD stage

```cpp
class ExampleExtension : public IExampleCarbInterface, public PXR_NS::TfWeakBase {
public:

    void setStageFromStageId(long stageId) override {
        if (stageId) {
            m_stage = PXR_NS::UsdUtilsStageCache::Get().Find(PXR_NS::UsdStageCache::Id::FromLongInt(stageId));
        }
    }

    void printStageInfo() const override {

        if (!m_stage) {
            return;
        }

        CARB_LOG_WARN("---Stage Info Begin---\n");

        // Print the USD stage's up-axis.
        const PXR_NS::TfToken stageUpAxis = PXR_NS::UsdGeomGetStageUpAxis(m_stage);
        CARB_LOG_WARN("Stage up-axis is: %s.\n", stageUpAxis.GetText());

        // Print the USD stage's meters per unit.
        const double metersPerUnit = PXR_NS::UsdGeomGetStageMetersPerUnit(m_stage);
        CARB_LOG_WARN("Stage meters per unit: %f.\n", metersPerUnit);

        // Print the USD stage's prims.
        const PXR_NS::UsdPrimRange primRange = m_stage->Traverse();
        for (const PXR_NS::UsdPrim& prim : primRange) {
            CARB_LOG_WARN("Stage contains prim: %s.\n", prim.GetPath().GetString().c_str());
        }

        CARB_LOG_WARN("---Stage Info End---\n\n");
    }
private:
    PXR_NS::UsdStageRefPtr m_stage;
};
```

The `kit` SDK dependency is Conan-provided, together with some `apps/.kit` files to kickstart a simple viewport-enabled OVComposer-like app with the `omni.hello.world` extension loaded. Thanks to the `_build/` folder structure it is enough to run it like this
```bash
conan_cmake_template$ $ ./_build/linux-x86_64/release/kit/kit ./_build/linux-x86_64/release/apps/omni.app.kit.dev.kit
```
to start the OV app where you can later create an empty stage and have the `omni.hello.world` kick in and print from C++ some debug stats on the opened USD stage.

With Conan managing the packman dependencies one just needs to figure out the NVIDIA distribution CDN URL for a specific package, e.g. by using

```bash
$ ./tools/packman list carb_sdk -r packman:cloudfront -st
```

to have a streamlined building experience:

```bash
# Make sure you clone this repo with the ov_utils submodule as well
conan_cmake_template$ git clone --recursive git@github.com:learnomniverse/conan_cmake_template.git
conan_cmake_template$ ./ov_utils/deps/install_all_deps.sh # Download and locally install all dependencies via Conan
# Create the CMake build files that will reference Conan dependencies automatically in a _compiler/ directory
conan_cmake_template$ conan install . --output-folder _compiler
conan_cmake_template$ cd _compiler
# Execute CMake configure to generate the final Makefiles. Use the conan-linux-release preset (so that deps
# will be visible) and use the CMakeLists.txt file in the parent '..' folder.
# This will also generate the _build/ folder hierarchy of directories and symlinks.
conan_cmake_template/_compiler$ cmake --preset conan-linux-release ..
# Build the project. This is equivalent to just calling `make`
conan_cmake_template/_compiler$ cmake --build . --config Release
conan_cmake_template/_compiler$ cd ..
# Enjoy your fully-built Kit app based on your omni.hello.world extension!
conan_cmake_template$ $ ./_build/linux-x86_64/release/kit/kit ./_build/linux-x86_64/release/apps/omni.app.kit.dev.kit
# Create a new empty stage from the File menu and observe the console warnings
```

The most important files to configure your extension repository are:

* the root `conanfile.py`: after pulling and installing NVIDIA CDN-provided dependencies through the `ov_utils/` scripts, this file allows you to specify which dependencies your extension needs and to use the `CMakeToolchain` generator (to let CMake be aware of the Conan toolchain easily via presets) and the `CMakeDeps` (to let you find them via `find_package` calls).
* the main `CMakeLists.txt` CMake file which lets you create a hierarchical `_build/` folder structure via easy-to-use utility functions

    ```cmake
    create_folder_structure(${CMAKE_CURRENT_SOURCE_DIR}/_build
    "
    ${OS_AND_ARCHITECTURE}
    +-- ${BUILD_CONFIG}
    |   +-- apps -> ${CMAKE_CURRENT_SOURCE_DIR}/apps
    |   +-- exts
    |   |   +-- omni.hello.world
    |   |       +-- bin
    |   |       +-- config -> ${OMNI_HELLO_WORLD_DIR}/config
    |   |       +-- data -> ${OMNI_HELLO_WORLD_DIR}/data
    |   |       +-- docs -> ${OMNI_HELLO_WORLD_DIR}/docs
    |   |       +-- omni
    |   |           +-- hello
    |   |               +-- world
    |   |                   +-- bindings
    |   |                   +-- scripts -> ${OMNI_HELLO_WORLD_DIR}/python/scripts
    |   +-- kit -> ${kit_sdk_PACKAGE_FOLDER_RELEASE}
    target-deps
    +-- nv_usd -> ${nv_usd_PACKAGE_FOLDER_RELEASE}
    +-- carb_sdk -> ${carb_sdk_PACKAGE_FOLDER_RELEASE}
    +-- pybind11 -> ${pybind11_PACKAGE_FOLDER_RELEASE}
    +-- python -> ${python_PACKAGE_FOLDER_RELEASE}
    ")
    ```
    and generate both the native C++ and the pybind11 bindings modules easily.

These two files contain the bare minimum required to have a fully functional OV build experience.