docker build -t emergency-connect/resource-service:1.0.1 ./resource-service
docker build -t emergency-connect/incident-service:1.0.1 ./incident-service
docker build -t emergency-connect/dispatch-service:1.0.1 ./dispatch-service
docker build -t emergency-connect/audit-service:1.0.6 ./audit-service
kubectl delete pod -l app=resource-service -n emergency-connect
kubectl delete pod -l app=incident-service -n emergency-connect
kubectl delete pod -l app=dispatch-service -n emergency-connect
kubectl delete pod -l app=audit-service -n emergency-connect
