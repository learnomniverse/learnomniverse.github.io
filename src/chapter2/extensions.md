# Extensions

Omniverse extensions are the core blocks of Omniverse. [As already stated](../chapter1/kit_applications.md) Kit apps are Kit instances loading different sets of extensions specified in `.kit` files: different extensions each modify part of the UI, add additional features that other extensions can leverage, provide different system functionalities, etc.

Most Kit apps like Composer (formerly Create), Presenter (formerly View), Code, Machinima, IsaacSim and many others are assembled this way.

## Developing an extension

Omniverse allows you to develop native C++ extensions (great for performance-intensive tasks), Python extensions (flexible, easy to write and well integrated into the UI framework) or mixed extensions (C++ and Python together with [pybind11](https://github.com/pybind/pybind11) bindings - this is a good tradeoff if you want for example your high-performance logic in native code and capable of interacting seamlessly with UI/user interaction code in Python).

A good repository of both python/C++/mixed extension code samples is available in the [NVIDIA official github here](https://github.com/NVIDIA-Omniverse/kit-extension-template-cpp/). Combined with the [official detailed development documentation](https://docs.omniverse.nvidia.com/dev-guide/latest/index.html) and [kit manual docs](https://docs.omniverse.nvidia.com/kit/docs/kit-manual/latest/guide/extensions_advanced.html)(advanced), these can all be an excellent source of information on how to develop Omniverse extensions.

This chapter will focus on providing the easiest possible experience for a new Omniverse developer. We will first introduce Python only extensions (the easiest) and then work our way towards native C++ extensions and Hybrid extensions.