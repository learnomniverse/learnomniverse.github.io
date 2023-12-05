## repo_man - the Omniverse Repo Tools Framework

Official docs: [Repo Tools Framework](http://omniverse-docs.s3-website-us-east-1.amazonaws.com/repo_man/1.50.2/docs/overview.html)

As already stated the `repo_tools` framework comprises several tools

```bash
kit-project-template$ ./repo.sh --help # which actually calls 'tools/packman/python.sh tools/repoman/repoman.py "$@"'
usage: repo [-h] [-v] [-p] [-pr] [-pt] [-tb] [--set-token CUSTOM_TOKENS] [TOOL] ...

Repo Tool (repoman):
    One entry point for all repo tools. Pass one of the tools and -h to get help.

options:
  -h, --help            show this help message and exit
  -v, --verbose         Increase verbosity of logging. Pass -v for info, -vv for verbose.
  -p, --print-config-file
                        Output tool default config file and exit.
  -pr, --print-resolved-config
                        Output tool resolved config and exit.
  -pt, --print-tokens   Output all known tokens and exit.
  -tb, --tracebacks     Enable Python traceback logging to console + TeamCity buildProblem reporting.
  --set-token CUSTOM_TOKENS
                        You can define and set custom tokens. Token name and value should be colon delimited e.g.: `--set-token test_token:test_value`. A
                        single token definition can be set per `--set-token` call.

Found tools:
    build            Build system main command.
    ci               Entry point to CI jobs.
    changelog        Utilities related to generating changelogs and release notes
    format           Format all C++ code (with clang-format) and all python code (with black).
    kit_autoupdate   Tool to automatically update kit dependency to latest version and push changes.
    link_app         Tool to create a folder link to an App in Omniverse Launcher.
    pull_extensions  Tool to pull kit kernel and extensions before running.
    package          Tool to package an Omniverse app ready to be run by Launcher or as standalone.
    stage_for_github Tool to strip down parts of repo and stage for github.
    tracetools       CLI and GUI tool to manage source links in packman project files.
    bump             Tool to bump versions of Kit extensions and apps.
    licensing        Module to gather and/or validate licenses in a package
    update           Tool to update packman project files with newer versions of packages. By default major part of version is kept the same when looking for a newer version.
    publish          Publish archives (packages) and labels to packman remote.
    build_number     Tool to generate build number.
    packman          Shortcut to packman.
    _package         Package files, folders, build artifacts.
    source           CLI and GUI tool to manage source links in packman project files and kit extensions.
    test             Test Runner.
    stubgen          Tool to generate stub files (.pyi) for python modules compiled with pybind11.
    precache_exts    Tool to precache kit apps. Downloads extensions without running.
    ui_docstring     Generate docstring macros for omni.ui.

Run as 'repo [TOOL] -h' for more information on a specific tool.
```

The bare minimum directory structure to use `repo_man`, by convention, is committing into your repository (which might contain as well an `ext/omni.hello.world` python extension, a `source/extensions/omni.hello.world` C++ extension or a `some_other_made_up_subpath/omni.my.cool.ext` hybrid extensions) the `tools` directory containing

```
kit-project-template/
├─ tools/
   ├─ packman/
      ├─ bootstrap/
      ├─ config.packman.xml
      ├─ ...
   ├─ repoman/
      ├─ repoman.py
```

i.e. the complete bootstrapping scripts for packman and the main `repoman.py` bootstrapping file (which will call the actual `repo_man` tool after packman has downloaded it).

Inside `repoman.py` there's usually something like

```python
REPO_ROOT = os.path.join(os.path.dirname(os.path.realpath(__file__)), "../..")
REPO_DEPS_FILE = os.path.join(REPO_ROOT, "deps/repo-deps.packman.xml")
```

the `REPO_DEPS_FILE` is the starting dependencies xml text file which describes which `repo_man` tools should be downloaded first via packman (e.g. if this repository contains at least one native/hybrid C++ extension, you might probably want the `repo_build` tool.. otherwise you might have to invoke the build system yourself manually - which in OV's case is premake, we'll see more about this later - and generate the Makefiles/.sln solution files and build everything yourself, `repo_build` takes care of all these things for you) because they will be needed by many later stages of building the repository extensions, setting up a Kit instance to test those extensions, packaging those extensions (which involves removing CI-sensitive data, gathering licenses, etc.) and publishing them to a registry so other Omniverse users can pull them and use them.

The first dependencies file is usually in `deps/repo-deps.packman.xml` but it can be located anywhere really.

```bash
kit-project-template$ cat deps/repo-deps.packman.xml
<project toolsVersion="5.0">
  <dependency name="repo_build" linkPath="../_repo/deps/repo_build">
    <package name="repo_build" version="0.40.0"/>
  </dependency>
  <dependency name="repo_ci" linkPath="../_repo/deps/repo_ci">
    <package name="repo_ci" version="0.5.1" />
  </dependency>
  <dependency name="repo_changelog" linkPath="../_repo/deps/repo_changelog">
    <package name="repo_changelog" version="0.3.0" />
  </dependency>
  <dependency name="repo_format" linkPath="../_repo/deps/repo_format">
    <package name="repo_format" version="2.7.0" />
  </dependency>
  <dependency name="repo_kit_tools" linkPath="../_repo/deps/repo_kit_tools">
    <package name="repo_kit_tools" version="0.12.18"/>
  </dependency>
  <dependency name="repo_licensing" linkPath="../_repo/deps/repo_licensing">.
    <package name="repo_licensing" version="1.11.2" />
  </dependency>
  <dependency name="repo_man" linkPath="../_repo/deps/repo_man">
    <package name="repo_man" version="1.32.1"/>
  </dependency>
  <dependency name="repo_package" linkPath="../_repo/deps/repo_package">
    <package name="repo_package" version="5.8.5" />
  </dependency>
  <dependency name="repo_source" linkPath="../_repo/deps/repo_source">
    <package name="repo_source" version="0.4.2"/>
  </dependency>
  <dependency name="repo_test" linkPath="../_repo/deps/repo_test">
    <package name="repo_test" version="2.5.6"/>
  </dependency>
</project>
```

The dependency file above tells packman which packages to download (and packman is by default configured to download these from the `config.packman.xml` public NV CDN), which versions and what symbolic links to create for these tools: in this case multiple directories will be created in the root of the repository, each one in `_repo/deps/toolname` (remember underscore-`_prefixed` directories are development/internal only in the Omniverse build system).

You can inspect these directories yourself and take a look at the various `repo_man` scripts.

## repo.toml

In the root of a `repo_man` repository there must be a `repo.toml` file which can even be empty.

This file (each `.toml` file is just configuration directives) contains configurations for the `repo_man` tools.

In the `kit-project-template` sample repository there is this one:

```bash
$ cat repo.toml
########################################################################################################################
# Repo tool base settings
########################################################################################################################

[repo]

# import two other repo.toml files, these two have directives for packman and configurations for the various tools
# specifically for one purpose: make sure that this repository, which is a kit-based repository, has everything it
# needs to work as a kit-instance extensions repository (repo_kit_tools/kit-template/repo.toml).
# Plus it's an external public user-facing repository, not an NVIDIA internal one (repo_kit_tool/kit-template/repo-external.toml).
import_configs = [
    "${root}/_repo/deps/repo_kit_tools/kit-template/repo.toml",
    "${root}/_repo/deps/repo_kit_tools/kit-template/repo-external.toml",
]

# some other settings..
extra_tool_paths = [
	"${root}/kit/dev",
]

[repo_precache_exts]
# Apps to run and precache so it'll load faster..
apps = [
    "${root}/source/apps/my_name.my_app.kit"
]

```

Notice the `import_configs`, this is similar to C++ `#include <header>` directives: it imports another configuration directly in that text file part (see [docs here](https://docs.omniverse.nvidia.com/kit/docs/kit-template/latest/content.html#config-files)).
If you take a look inside the `repo_kit_tools/kit-template/repo.toml` you'll find some more directives for a generic kit-based extensions-containing repository:

```bash
# of course do this _after_ having run repo_man once to create all the _repo/deps/etc. symlinks..
kit-project-template$ cat _repo/deps/repo_kit_tools/kit-template/repo.toml
[repo_build]

# List of packman projects to pull (in order)
fetch.packman_host_files_to_pull = [
    "${root}/deps/host-deps.packman.xml",
]

fetch.packman_target_files_to_pull = [
    "${root}/deps/app.packman.xml",
    "${root}/deps/kit-sdk.packman.xml", # <---- also fetch whatever is defined in this file!
    "${root}/deps/kit-sdk-deps.packman.xml",
    "${root}/deps/rtx-plugins.packman.xml",
    "${root}/deps/target-deps.packman.xml",
    "${root}/deps/assets.packman.xml",
    "${root}/deps/ext-deps.packman.xml",
]
```

Note that the `deps/kit-sdk.packman.xml` file is also used to fetch other dependencies (this is the text xml file where `kit-sdk` dependencies are usually defined, i.e. what `kit-sdk` version to use, whether it's a full-blown kit or just a kit-kernel, is it release, debug, etc. - or maybe even local on some filesystem path and we want to use that one instead of downloading one from the internet), then there are others (`kit-sdk-deps` - additional dependencies specifically for the kit sdk, `target-deps` - dependencies of the target itself, i.e. of your own repository, this would be a good place to put the PhysX SDK if your extension called into its native C++ engine libraries, etc.).

Note that in the `kit-project-template` there's also a `deps/user.toml` file. That is not part of `repo_man` but rather an override `.toml` file for Kit instances: [see documentation here](https://docs.omniverse.nvidia.com/kit/docs/kit-manual/latest/guide/configuring.html#system-configs).


To summarize, a common Kit-based repository containing Omniverse extensions and using `repo_man` structure might look like the following:

```
my-kit-project/
├─ _build/ // build directory. This is development only. Contains build artifacts and the folder structure
|          // that is needed to find the kit instance, the apps/whatever.kit files that define the extensions for
|          // a specific kit application, the symlinks to the data/ folders (for resources/videos/icons/etc.),
|          // the target-deps/ folders where PhysX SDK or pip packages your extension depends on might live, etc.
|          // Everything here is usually platform-specific and configuration (release/debug) specific.
├─ deps/ // this directory could be somewhere else or miss entirely, but it's usually in this spot for convention
|     ├─ repo-deps.packman.xml // repo_man tools that this repository will use
|     ├─ kit-sdk.packman.xml // which kit to download (or find somewhere in the local filesystem)
|     ├─ target-deps.packman.xml // which dependencies to download for the extensions in this repository
├─ tools/ // base packman and repoman bootstrapping scripts (these get checked in into git)
   ├─ packman/
      ├─ bootstrap/
      ├─ config.packman.xml
      ├─ ...
   ├─ repoman/
      ├─ repoman.py
├─ repo.toml // base repo_man mandatory toml. Can be empty.
├─ repo.(sh|bat) // this is optional, makes calling into tools/repoman/repoman.py easier.
```

## Using dependencies in your local machine (not from packman's CDN)

In case you wanted to have your application link (in case of C++ code) or depend and use a kit instance or any other dependency library not downloading it from packman but finding it somewhere on your local filesystem, the `repo_man` tool can help setting that up very easily:

```bash
kit-project-template$ ./repo.sh source link /home/alex/some-kit-kernel-I-previously-downloaded
Found matching package: kit-kernel in: /home/alex/some-kit-kernel-I-previously-downloaded
Adding link: kit-kernel '../../kit' -> '/home/alex/some-kit-kernel-I-previously-downloaded/kit'
Writing file: '/home/alex/kit-project-template/deps/kit-sdk.packman.xml.user'...
Done
```

This creates, together with the `deps/kid-sdk.packman.xml` file, an override text xml file called `deps/kid-sdk.packman.xml.user`. `.user` files are _override_ files, i.e. they take precedence over whatever dependency with the same name is defined in the `.xml` file with their same name (after dropping `.user`). In this case the `.user` file that `repo.sh source link some_local_path` added contains:

```bash
$ cat deps/kit-sdk.packman.xml.user
<project toolsVersion="5.6">
	<dependency name="kit-kernel" linkPath="../../kit">
		<source path="/home/alex/some-kit-kernel-I-previously-downloaded/kit" />
	</dependency>
</project>
```

One could have avoided all this hassle in the first place by just writing the original `deps/kit-sdk.packman.xml` file as

```xml
<project toolsVersion="5.0">
  <dependency name="kit-kernel" linkPath="../../kit" tags="${config} non-redist">
    <!-- <package name="kit-kernel" version="105.1+release.127680.dd92291b.tc.${platform}.${config}"/> -->
    <source path="/home/alex/some-kit-kernel-I-previously-downloaded/kit" />
  </dependency>
</project>
```

but a `.user` file is usually preferable:

* it doesn't get committed into git (if the `.gitignore` excludes it, that is)
* it's easier to just revert to the internet-downloaded package by just removing all of the `.user` override files.

These `.user` overrides are meant for local development only and not for redistributing/permanent dependencies.
