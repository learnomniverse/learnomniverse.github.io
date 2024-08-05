# What is Omniverse
Omniverse is a platform and a series of technologies developed by NVIDIA around the USD standard (although they’re rapidly evolving in other directions as well).

```admonish warning title="Learn OpenUSD before Omniverse"
Understanding the USD format is key to understanding many features of Omniverse and unlock its full potential.

It is **highly encouraged** to learn more about OpenUSD [in this dedicated book](https://omniverseusd.github.io) before proceeding on to studying Omniverse.
```

At a thousand feet overview, Omniverse can be defined as a vast _customizable_ framework of technologies and applications to work with 3D graphics, collaborating on creating 3D assets and scenes, using AI to create stunning visual effects or improve the process of creating 3D contents, adding real-time and physically correct physics behaviors to 3D contents, rendering in a physically-correct way with ray tracing or path tracing in real-time, etc.

NVIDIA doesn’t impose any workflow or dictate how Omniverse tools and technologies should be used (they can be used to create photorealistic render images that you later use commercially, they can be used to let multiple 3D artists work on a 3D scene simultaneously without interfering with each other’s modifications, they can be used to ‘predict’ the mechanical ‘wear’ in a ‘digital twin’ 3D representation of a mechanical part in 3D with accurate physics after many simulation steps, they can be used to create a [server-side web service](https://docs.omniverse.nvidia.com/dev-guide/latest/programmer_ref/services.html) which renders something complex and streams the result as a video back to the user’s browser, etc.).

Omniverse is meant to be customized according to your desires, therefore users are meant to write extensions (i.e. libraries written in Python, C++, both or in other languages as well) so that these can leverage NVIDIA’s best-in-breed technologies (e.g. RTX raytracers, PhysX, AI integrations, etc.) to do useful graphical work for them.

We will dive more into extensions later in this book.

## Pricing and requirements

Two things newcomers usually care a lot about: pricing and requirements.

**Omniverse requires a license, for which there are both free and commercial options**: see [Omniverse Licensing after registration](https://www.nvidia.com/en-us/omniverse/download/).

More in detail (from the official discord):

Omniverse (we're referring to SDK here, there are also cloud APIs which are governed by their own licensing and pricing terms) allows you to compose applications out of extensions as building blocks. Composer, View, IsaacSim are examples of multiple-specific-extensions-composed desktop applications.

IsaacSim is a free and unsupported _reference application_ built on top of Omniverse (Composer and View are in the process of being no longer officially supported but can be used as reference applications as well for now).

Omniverse, with the IsaacSim reference application, has the following licensing options:

* A free development, testing and research license for an individual user  without a limit on number of GPUs (via the NVIDIA developer program)
* A free annual EDU license (education and academic research only) per GPU without enterprise support
* A paid annual commercial license (Omniverse Enterprise) per GPU with enterprise support for Omniverse, for which NVIDIA also offers EDU pricing.

This basically means:
* If (EDU) builds an app and uses it internally for research/education, they can utilize the free EDU license.
* If you use IsaacSim to build an app that is then used internally for production, each GPU needs to be licensed. This would be commercial usage.
* If (non-EDU) wants to resell / distribute that application, non-EDU can either (1) embed and resell Omniverse Enterprise as part of the application or (2) require customers to have an OVE license for each GPU running that application.

So essentially a lot of the confusion comes from the fact IsaacSim is built on OV, and using OV is subject to the license terms NVIDIA provides it under, i.e. there is a dependency on it. The cases in which it would be free is with that edu license (without support), or the individual license. IsaacSim is being treated as a separate product but the licensing is still tied.

Nucleus Licensing will charge per instance/node, since it doesn't actually required a GPU to be run. The number of people who can work on it is unlimited.

For any other question or clarification please read the final paragraph of this post and get in contact with NVIDIA sales for a special license tailored to your needs: [omniverse-license-questions@nvidia.com](mailto:omniverse-license-questions@nvidia.com) will get you in touch with a developer relations manager that can work with you.

Regarding Omniverse requirements, each application that works on the Omniverse platform might have different system requirements. The suggested way to get up-to-date information is to browse the NVIDIA website for the app you’re specifically interested in, e.g. [the USD Composer/Create page](https://www.nvidia.com/en-us/omniverse/apps/create/) lists requirements like a RTX class card as minimum viable hardware.


## Support, learning, official resources

Omniverse is vast and asking for help is often of paramount importance.

Official channels to learn more about Omniverse, post questions regarding its official applications and main extensions (e.g. related to omni.physx) and get in touch with the great NVIDIA Omniverse community (friendly and available, NVIDIA is doing its best to foster a good community) are the [Omniverse discord server](https://forums.developer.nvidia.com/t/omniverse-discord-server-is-live/178422), the [YouTube Omniverse channel](https://www.youtube.com/c/nvidiaomniverse), the [developer blog articles](https://developer.nvidia.com/blog/tag/omniverse/) and, for critical bugs/issues, the [official Omniverse forum](https://forums.developer.nvidia.com/c/omniverse/) (less chatty, more support-y).

Any non-Omniverse related question should not be asked in the above channels but rather in the [NVIDIA customer support forum](https://www.nvidia.com/en-us/support/).

```admonish tip title="Take advantage of the supportive Omniverse Community!"
Readers are **highly encouraged** to take advantage of these support resources as it'll make their journey into the Omniverse ecosystem a lot easier and, if you're developing connectors or extensions for your business, provide the technical support and expertise to accomplish your goals.
```