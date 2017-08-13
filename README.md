# Minestats [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Ethereum mining dashboard
![Dashboard GUI](https://d.pr/i/POsOgd+)

## How to install

Clone the repo

```bash
git clone git@github.com:EKMN/Minestats.git
```

Install all dependencies

```bash
cd Minestats && npm install
```

Spawn a few slave instances

```bash
node server --slave --name miner01
```

Then start a master-controller

```bash
node server --master
```

This will start a server at `http://localhost:3000`

## Available flags

* `--name miner01` ( **string**: app name )
* `--port 8080` ( **integer**: port )
* `--domain myhost.dev` ( **string**: custom domain )
* `--standalone` ( **boolean**: true/false )
* `--nologs` ( **boolean**: true/false )
