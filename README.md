hello world example of running docker containers on digitalocean.
uses Traefik for routing + letsencrypt SSL.

given a digitalocean API key,
creates a machine and deploys containers.

with DNS configured,
"webservice" containers automatically get SSL certs and routing based on the hostname.
config looks like this:

```ts
makeWebService({
  serviceName:  'example-cats',
  imageName: 'goncalommarques/flask-cat-gif',
  hostname: 'cats.playground.kumavis.me',
  internalPort: 5000,
  provider: dockerProvider,
});
```

`pulumi up` applies the changes.


### setup
- install pulumi
- pulumi login --local

- git clone (this repo) + npm install
- pulumi config set --secret digitalocean:token 'your_api_key'

- modify config to your liking
- `pulumi up`
- after you get your ip address, point your dns to it
- be sure to point A thing.com and A *.thing.com to your ip
- letsencrypt will fail at first because the IP address wasnt ready, idk something

### ongoing
- make changes, `pulumi up`

### notes
there are some utility scripts in `./scripts` but they require `PULUMI_CONFIG_PASSPHRASE` env var set