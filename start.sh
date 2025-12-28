#!/bin/bash

# Fonction pour attendre qu'un déploiement soit prêt
wait_for_deployment() {
    local deployment_name=$1
    echo "En attente du déploiement $deployment_name..."
    kubectl rollout status deployment/$deployment_name
}

echo "Démarrage de l'application ToDo List sur Minikube..."

# Vérifier si Minikube est lancé
if ! minikube status | grep -q "Running"; then
    echo "⚠️ Minikube n'est pas lancé. Démarrage..."
    minikube start
fi

# Configurer l'environnement Docker pour utiliser celui de Minikube
eval $(minikube docker-env)

# Construire les images Docker
echo "Construction des images Docker"
minikube image build -t todo-backend:latest ./backend
minikube image build -t todo-frontend:latest ./frontend

# Appliquer les configurations Kubernetes
echo "Application des configurations Kubernetes"
kubectl apply -f k8s/

# Attendre que les pods soient prêts
echo "Attente du démarrage des pods"
kubectl wait --for=condition=ready pod --all --timeout=60s

# Afficher les URLs
echo "✅ Application déployée avec succès !"
echo ""
echo "Pour accéder à l'application :"
echo "   Exécutez dans un autre terminal : minikube tunnel"
echo "   Ou utilisez l'URL directe ci-dessous :"
minikube service frontend --url
