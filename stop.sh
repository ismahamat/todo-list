#!/bin/bash

echo "🛑 Arrêt de l'application ToDo List..."

# Supprimer les ressources Kubernetes
kubectl delete -f k8s/

echo "✅ Application arrêtée et ressources nettoyées."
echo "ℹ️  Note : Minikube est toujours en cours d'exécution. Pour l'arrêter, tapez 'minikube stop'."
