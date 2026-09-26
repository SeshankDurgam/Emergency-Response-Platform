# Kubernetes Manifests

This folder will hold all Kubernetes deployment files.

Planned structure:

```
k8s/
  namespace.yml
  configmap.yml
  secrets.yml
  eureka-server/
    deployment.yml
    service.yml
  auth-service/
    deployment.yml
    service.yml
  incident-service/
    deployment.yml
    service.yml
  resource-service/
    deployment.yml
    service.yml
  dispatch-service/
    deployment.yml
    service.yml
  audit-service/
    deployment.yml
    service.yml
  kafka/
    statefulset.yml
    service.yml
  redis/
    deployment.yml
    service.yml
  kong/
    deployment.yml
    service.yml
    ingress.yml
```

Deploy order: namespace and secrets first, then infrastructure (kafka, redis), then eureka-server, then all business services, then kong.
