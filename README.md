# srszd-scrape

## Token

Remenber to create `key.js` to export your own token.

```
module.exports = {
    token: 'xxxxxx'
}
```

## Build

```
docker build -t hitoka/srszd-scrape-cheeriover .
```

## Run
```
docker run -d hitoka/srszd-scrape-cheeriover
```

## Enter into Work Directory

```
docker exec -it container_id /bin/sh
```
You can look up the logs in work directory.