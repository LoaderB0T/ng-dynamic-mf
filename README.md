[![npm](https://img.shields.io/npm/v/ng-dynamic-mf?color=%2300d26a&style=for-the-badge)](https://www.npmjs.com/package/ng-dynamic-mf)
[![LGTM Grade](https://img.shields.io/lgtm/grade/javascript/github/LoaderB0T/ng-dynamic-mf?label=Code%20Quality&style=for-the-badge)](https://lgtm.com/projects/g/LoaderB0T/ng-dynamic-mf/?mode=list)
[![LGTM Alerts](https://img.shields.io/lgtm/alerts/github/LoaderB0T/ng-dynamic-mf?style=for-the-badge)](https://lgtm.com/projects/g/LoaderB0T/ng-dynamic-mf/?mode=list)

# ng-dynamic-mf

Truly dynamic modules at runtime with Module Federation!

## Motivation 💥

Module Federation gets a lot of attention lately - and rightfully so!
For Angular there is the awesome [Module Federation Plugin](https://github.com/angular-architects/module-federation-plugin).
ng-dynamic-mf builds upon this plugin and aims to bring the modularity of Module Federation in Angular to the next level by providing methods to easily load modules at runtime.

## Features 🔥

✅ Dynamic loading of modules at runtime

✅ The host/shell application does not need to be aware of the modules it loads

✅ Modules can be loaded from any location (e.g. from a CDN) that can be unknown to the developer

✅ Modules can be deployed on demand without modifying the host/shell application

✅ Assets are resolved correctly at runtime (both for running the app standalone and in a shell) with a provided pipe.

✅ (Future) Support for custom routing logic (Register module routes as child of any other module)

This project aims to improve the general experience of developers using Module Federation in Angular. Even if you don't _need_ truly dynamic modules, you can still benefit from this project.

## Built With 🔧

- [TypeScript](https://www.typescriptlang.org/)
- [Angular](https://angular.io/)

## Getting Started 🚀

-- TODO --

## Contributing 🧑🏻‍💻

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 🔑

Distributed under the MIT License. See `LICENSE.txt` for more information.

## Contact 📧

Janik Schumacher - [@LoaderB0T](https://twitter.com/LoaderB0T) - [linkedin](https://www.linkedin.com/in/janikschumacher/)

Project Link: [https://github.com/LoaderB0T/ng-dynamic-module-federation](https://github.com/LoaderB0T/ng-dynamic-module-federation)

[module-federation-plugin-url]: https://github.com/angular-architects/module-federation-plugin
