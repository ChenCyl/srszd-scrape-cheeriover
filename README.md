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

----

> If using dockerhub

### Build
```
docker build -t {dockerhub-username}/frontend .
```

### Push
```
docker login -u {dockerhub-username}
docker tag {dockerhub-username}/frontend {dockerhub-username}/frontend
docker push {dockerhub-username}/frontend
```

If there is an error, see https://github.com/aws/aws-cli/issues/3264
```
Error saving credentials: error storing credentials - err: exit status 1, out: `The user name or passphrase you entered is not correct.`
```

## Pull
```
sudo docker pull {dockerhub-username}/frontend
```

### Run
```
sudo docker run -p 9998:8080 -d {dockerhub-username}/frontend
```