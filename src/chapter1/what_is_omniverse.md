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

**Omniverse is free to use for individuals, but a license must be purchased for team use**: [Omniverse Licensing](https://www.nvidia.com/en-us/omniverse/download/).

More in detail (from the official discord):

```admonish quote
Omniverse users are welcome to sell their extensions for whatever they please. The end users must have a license of Omniverse to use their extensions with, but that can be the free Omniverse Individual version.
```

So programmers are free to write and sell their Omniverse extensions. Users can buy and use those extensions as long as they do it abiding by the Omniverse license (i.e. if they're working as a team of 20 people with Omniverse, an enterprise license must be purchased). If they're working as individuals (or teams of 2 people), no license is necessary and Omniverse is totally free.

What about 3D content I create with e.g. Omniverse Composer (we will take a look at this in the next section)? Can I sell a rendered video of a Physical simulation made with Omniverse?

```admonish quote
Content and or code\extensions\apps created using OVI (Omniverse Individual license, i.e. abiding by the 2-users-tops requirement) for small teams, using desktops or cloud resources is allowed and can be used for commercial purposes.
```

So yes: you can create a video using Omniverse and you can sell it for whatever you want.

Can I use Omniverse in my own private cloud?

```admonish quote
For the free version, you are allowed to put Omniverse in the cloud for your own purposes. For example, you are allowed to put OV apps on Azure or AWS VM, create 3D projects and render out those projects using Omniverse Farm which can also be on an Azure VM for free.

The EULA is designed that once you scale the number of users working together and you need support, you should get the enterprise license.

Other licensing example, You can also use the Omniverse Individual version to create, build, sell your own extensions and or apps for free. The user leveraging that extension or app just needs to follow the same EULA.
```

The only other restriction pertains to letting users use your "abiding OVI individual license" Omniverse apps as cloud services:

```admonish quote
Lets say for example, you put USD Composer in the cloud and allow anyone to use it for free as a streamed application. This would not be allowed, using OVI as a service to users outside your company.
```

For any other question or clarification please read the final paragraph of this post and get in contact with NVIDIA sales for a special license tailored to your needs: [omniverse-license-questions@nvidia.com](mailto:omniverse-license-questions@nvidia.com) will get you in touch with a developer relations manager that can work with you.

Regarding Omniverse requirements, each application that works on the Omniverse platform might have different system requirements. The suggested way to get up-to-date information is to browse the NVIDIA website for the app you’re specifically interested in, e.g. [the USD Composer/Create page](https://www.nvidia.com/en-us/omniverse/apps/create/) lists requirements like a RTX class card as minimum viable hardware.


## Support, learning, official resources

Omniverse is vast and asking for help is often of paramount importance.

Official channels to learn more about Omniverse, post questions regarding its official applications and main extensions (e.g. related to omni.physx) and get in touch with the great NVIDIA Omniverse community (friendly and available, NVIDIA is doing its best to foster a good community) are the [Omniverse discord server](https://forums.developer.nvidia.com/t/omniverse-discord-server-is-live/178422), the [YouTube Omniverse channel](https://www.youtube.com/c/nvidiaomniverse), the [developer blog articles](https://developer.nvidia.com/blog/tag/omniverse/) and, for critical bugs/issues, the [official Omniverse forum](https://forums.developer.nvidia.com/c/omniverse/) (less chatty, more support-y).

Any non-Omniverse related question should not be asked in the above channels but rather in the [NVIDIA customer support forum](https://www.nvidia.com/en-us/support/).

```admonish tip title="Take advantage of the supportive Omniverse Community!"
Readers are **highly encouraged** to take advantage of these support resources as it'll make their journey into the Omniverse ecosystem a lot easier and, if you're developing connectors or extensions for your business, provide the technical support and expertise to accomplish your goals.
```