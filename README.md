# Ceris-1-2-cloud-registry

A private cloud container registry for storing and distributing Docker images.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)

## Quick Start

Clone the repository and start the registry with a single command:

```bash
git clone https://github.com/msmchX-UI/Ceris-1-2-cloud-registry.git
cd Ceris-1-2-cloud-registry
docker compose up -d
```

The registry will be available at **http://localhost:5000**.

## Configuration

Configuration is managed via `registry/config.yml`. Key settings:

| Setting | Default | Description |
|---|---|---|
| `http.addr` | `:5000` | Address and port the registry listens on |
| `storage.filesystem.rootdirectory` | `/var/lib/registry` | Where image data is stored on the host |
| `log.level` | `info` | Log verbosity (`debug`, `info`, `warn`, `error`) |

To persist image data between restarts, the `registry-data` Docker volume is created automatically.

## Usage

### Push an image

```bash
# Tag a local image for your registry
docker tag my-image:latest localhost:5000/my-image:latest

# Push it
docker push localhost:5000/my-image:latest
```

### Pull an image

```bash
docker pull localhost:5000/my-image:latest
```

### List available images

```bash
curl http://localhost:5000/v2/_catalog
```

### List tags for an image

```bash
curl http://localhost:5000/v2/my-image/tags/list
```

## Managing the Registry

| Command | Description |
|---|---|
| `docker compose up -d` | Start the registry in the background |
| `docker compose down` | Stop the registry |
| `docker compose logs -f` | Follow registry logs |
| `docker compose restart` | Restart the registry |

## Running on a Custom Port

Edit `docker-compose.yml` and change the port mapping under `ports`:

```yaml
ports:
  - "5001:5000"   # host:container
```

Then restart the registry:

```bash
docker compose down && docker compose up -d
```

## Troubleshooting

**Registry not reachable**
- Confirm Docker is running: `docker info`
- Check the container is up: `docker compose ps`
- View logs for errors: `docker compose logs registry`

**Push rejected by daemon (HTTP instead of HTTPS)**

Add the registry address to Docker's list of insecure registries. Edit (or create) `/etc/docker/daemon.json`:

```json
{
  "insecure-registries": ["localhost:5000"]
}
```

Then restart the Docker daemon and try again.

## License

MIT