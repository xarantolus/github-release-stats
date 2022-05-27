# [GitHub Release Stats](https://ghstats.010.one)
This is a simple [web application](https://ghstats.010.one) that shows stats about the releases of GitHub repositories.

**Features**
* Show stats for repositories
* Automatic light and dark mode depending on device settings
* Suggestions for repositories after typing in the username

[![Screenshot showing the summary section for one of my projects](.github/img/screenshot-darkmode.png)](https://ghstats.010.one/?user=xarantolus&repo=filtrite)

This project was very much inspired by [@Somsubhra](https://github.com/Somsubhra)'s [project with the same name](https://github.com/Somsubhra/github-release-stats), but I built this from scratch.

### Development setup
At first make sure you have `node` and `npm` installed. Then clone this repository and `cd` to its root directory.

Then install dependencies:
```
npm install
```

Now you can run the site with automatic reloads when you edit files:
```
npm run serve
```

After you're done, you can build for production:
```
npm run build
```

### [License](LICENSE)
This is free as in freedom software. Do whatever you like with it.
