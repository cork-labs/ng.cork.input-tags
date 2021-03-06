# ng.cork.input-tags
[![Build Status: Linux](http://img.shields.io/travis/cork-labs/ng.cork.input-tags/master.svg?style=flat-square)](https://travis-ci.org/cork-labs/ng.cork.input-tags)
[![Bower version](http://img.shields.io/bower/v/ng.cork.input-tags.svg?style=flat-square)](https://github.com/cork-labs/ng.cork.input-tags)

> AngularJS component for tag input.


## Getting Started

Add **ng.cork.input-tags** to you project.

Via bower:

```
$ bower install --save ng.cork.input-tags
```


Include the following JS and CSS files in your build:
- `dist/ng.cork.input-tags.js` OR `dist/ng.cork.input-tags.min.js`
- `dist/ng.cork.input-tags.css` OR `dist/ng.cork.input-tags.min.css`


The following bower dependencies must also be included:
- `vendor/ng.cx.generate/dist/ng.cx.generate.min.js`
- `vendor/ng.cork.throttling/dist/ng.cork.throttling.min.js`
- `vendor/ng.cork.pubsub/dist/ng.cork.pubsub.min.js`
- `vendor/ng.cork.ui.keys/dist/ng.cork.ui.keys.min.js`
- `vendor/ng.cork.ui.focus-on/dist/ng.cork.ui.focus-on.min.js`
- `vendor/ng.cork.ui.enter-click/dist/ng.cork.ui.enter-click.min.js`
- `vendor/ng.cork.ui.stop-propagation/dist/ng.cork.ui.stop-propagation.min.js`
- `vendor/ng.cork.deep/dist/ng.cork.deep.min.js` (required by ng.cork.ui.keys)


## Documentation

Make sure to check the [official documentation](http://jarvis.cork-labs.org/ng.cork.input-tags/current/docs) where you can find a
[guide](http://jarvis.cork-labs.org/ng.cork.input-tags/current/docs/#/guide), a few [demos](http://jarvis.cork-labs.org/ng.cork.input-tags/current/docs/#/demos) and the complete
[API reference](http://jarvis.cork-labs.org/ng.cork.input-tags/current/docs/#/docs).


## Contributing

We'd love for you to contribute to our source code and to make it even better than it is today!

Make sure you read the [Contributing Guide](CONTRIBUTING.md) first.


## Developing

Clone this repository, install the dependencies and simply run `grunt develop`.

```
$ npm install -g grunt-cli bower
$ npm install
$ bower install
$ ./bootstrap.sh
$ grunt develop
```

At this point, the source was validated, tested and built into the `build/` directory. A simple webserver is launched so
that you can browse the generated code, documentation and the code coverage. If you now edit and save any project file,
the necessary `grunt` tasks will be triggered to update the build and docs.

```
...
Running "serve:build" (serve) task
Started connect web server on http://0.0.0.0:8000

Running "watch" task
Waiting...
```

More info on the (Grunt based) tools can be found in the
[boilerplate documentation](http://jarvis.cork-labs.org/boilerplate-nglib/current/docs).


## [MIT License](LICENSE)

[Copyright (c) 2005 Cork Labs](http://cork-labs.mit-license.org/2015)

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
