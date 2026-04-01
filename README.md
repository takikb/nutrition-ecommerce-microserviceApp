
```
nutrition
├─ auth
│  ├─ .dockerignore
│  ├─ Dockerfile
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ src
│  │  ├─ errors
│  │  │  ├─ bad-request-error.ts
│  │  │  ├─ custom-error.ts
│  │  │  ├─ database-connection-errors.ts
│  │  │  ├─ not-authorized-error.ts
│  │  │  ├─ not-found-error.ts
│  │  │  └─ request-validation-error.ts
│  │  ├─ index.ts
│  │  ├─ middlewares
│  │  │  ├─ current-user.ts
│  │  │  ├─ error-handler.ts
│  │  │  ├─ require-auth.ts
│  │  │  └─ validate-request.ts
│  │  ├─ models
│  │  │  ├─ health-profile.ts
│  │  │  └─ user.ts
│  │  ├─ routes
│  │  │  ├─ current-user.ts
│  │  │  ├─ signin.ts
│  │  │  ├─ signout.ts
│  │  │  └─ signup.ts
│  │  └─ services
│  │     └─ password.ts
│  └─ tsconfig.json
├─ infra
│  └─ k8s
│     ├─ auth-depl.yaml
│     ├─ auth-mongo-depl.yaml
│     └─ ingress-srv.yaml
├─ schema.json
└─ skaffold.yaml

```

# Nutrition E-Commerce (K8s Setup)

## Prerequisites
- Docker Desktop (with Kubernetes enabled)
- Skaffold installed
- Node.js & Python installed

## First Time Setup (CRITICAL)
Before running Skaffold, you MUST create the JWT secret in your local Kubernetes cluster. Run this command in your terminal:

`kubectl create secret generic jwt-secret --from-literal=JWT_KEY=your_super_secret_key_here`

## Running the App
Run `skaffold dev ` in the root directory.

if you are using minikube, start it at first `minikube start`, then start a tunnel `minikube tunnel`, then run `skaffold dev`