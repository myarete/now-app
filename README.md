# now.app

[![Build Status](https://travis-ci.com/zeit/now-app.svg?token=CPbpm6MRBVbWVmDFaLxs&branch=master)](https://travis-ci.com/zeit/now-app)
[![Slack Channel](https://zeit-slackin.now.sh/badge.svg)](https://zeit.chat/)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

A macOS client that allows developers to access all of [ZEIT](https://zeit.co)'s services directly from their OS' menu bar.

## Usage

Simply download the application from [here](https://now-auto-updates.now.sh/download/osx) and put it into your "Applications" directory.

## Caught a bug?

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device
2. Install all dependencies: `npm install`
3. Bundle the source code and watch for changes: `npm run dev`
4. Start the app in a new terminal tab: `npm start`

If you want to build the binaries for all specified platforms, run the command:

```
$ npm run pack
```

After that, you'll see the binaries in the `./dist` folder!
