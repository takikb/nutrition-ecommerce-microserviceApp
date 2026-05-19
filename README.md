

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


```
nutrition
├─ auth
│  ├─ .dockerignore
│  ├─ Dockerfile
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ src
│  │  ├─ app.ts
│  │  ├─ index.ts
│  │  ├─ models
│  │  │  ├─ health-profile.ts
│  │  │  ├─ user.ts
│  │  │  └─ vendor-profile.ts
│  │  ├─ routes
│  │  │  ├─ current-user.ts
│  │  │  ├─ signin.ts
│  │  │  ├─ signout.ts
│  │  │  ├─ signup.ts
│  │  │  └─ __test__
│  │  │     ├─ current-user.test.ts
│  │  │     ├─ signin.test.ts
│  │  │     ├─ signout.test.ts
│  │  │     └─ signup.test.ts
│  │  ├─ services
│  │  │  └─ password.ts
│  │  └─ test
│  │     └─ setup.ts
│  └─ tsconfig.json
├─ chat
│  ├─ .dockerignore
│  ├─ Dockerfile
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ src
│  │  ├─ app.ts
│  │  ├─ events
│  │  │  ├─ listeners
│  │  │  │  ├─ order-cancelled-listener.ts
│  │  │  │  ├─ order-completed-listener.ts
│  │  │  │  ├─ order-created-listener.ts
│  │  │  │  ├─ product-deleted-listener.ts
│  │  │  │  ├─ product-update-listener.ts
│  │  │  │  ├─ queue-group-name.ts
│  │  │  │  └─ __test__
│  │  │  │     ├─ order-cancelled-listener.test.ts
│  │  │  │     ├─ order-completed-listener.test.ts
│  │  │  │     ├─ order-created-listener.test.ts
│  │  │  │     └─ product-deleted-listener.test.ts
│  │  │  └─ publishers
│  │  ├─ index.ts
│  │  ├─ models
│  │  │  ├─ conversation.ts
│  │  │  └─ message.ts
│  │  ├─ nats-wrapper.ts
│  │  ├─ routes
│  │  │  ├─ index-conversations.ts
│  │  │  ├─ new-conversation.ts
│  │  │  ├─ new-message.ts
│  │  │  ├─ read-messages.ts
│  │  │  ├─ show-messages.ts
│  │  │  ├─ unread-count.ts
│  │  │  └─ __test__
│  │  ├─ test
│  │  │  └─ setup.ts
│  │  └─ __mocks__
│  │     ├─ app.ts
│  │     └─ nats-wrapper.ts
│  └─ tsconfig.json
├─ client
│  ├─ .dockerignore
│  ├─ api
│  │  └─ build-client.js
│  ├─ components
│  │  └─ header.js
│  ├─ Dockerfile
│  ├─ hooks
│  │  └─ use-request.js
│  ├─ next.config.js
│  ├─ package-lock.json
│  ├─ package.json
│  └─ pages
│     ├─ auth
│     │  ├─ signin.js
│     │  ├─ signout.js
│     │  └─ signup.js
│     ├─ index.js
│     └─ _app.js
├─ common-lib
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ src
│  │  ├─ errors
│  │  │  ├─ bad-request-error.ts
│  │  │  ├─ custom-error.ts
│  │  │  ├─ database-connection-error.ts
│  │  │  ├─ not-authorized-error.ts
│  │  │  ├─ not-found-error.ts
│  │  │  └─ request-validation-error.ts
│  │  ├─ events
│  │  │  ├─ base-listener.ts
│  │  │  ├─ base-publisher.ts
│  │  │  ├─ order-cancelled-event.ts
│  │  │  ├─ order-completed-event.ts
│  │  │  ├─ order-created-event.ts
│  │  │  ├─ product-created-event.ts
│  │  │  ├─ product-deleted-event.ts
│  │  │  ├─ product-updated-event.ts
│  │  │  ├─ subjects.ts
│  │  │  └─ types
│  │  │     ├─ order-status.ts
│  │  │     └─ product.ts
│  │  ├─ index.ts
│  │  └─ middlewares
│  │     ├─ current-user.ts
│  │     ├─ error-handler.ts
│  │     ├─ require-auth.ts
│  │     ├─ require-role.ts
│  │     └─ validate-request.ts
│  └─ tsconfig.json
├─ infra
│  └─ k8s
│     ├─ auth-depl.yaml
│     ├─ auth-mongo-depl.yaml
│     ├─ chat-depl.yaml
│     ├─ chat-mongo.yaml
│     ├─ chat-redis-depl.yaml
│     ├─ client-depl.yaml
│     ├─ ingress-srv.yaml
│     ├─ nats-depl.yaml
│     ├─ orders-depl.yaml
│     ├─ orders-mongo-depl.yaml
│     ├─ products-depl.yaml
│     └─ products-mongo-depl.yaml
├─ orders
│  ├─ .dockerignore
│  ├─ Dockerfile
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ src
│  │  ├─ app.ts
│  │  ├─ events
│  │  │  ├─ listeners
│  │  │  │  ├─ product-created-listener.ts
│  │  │  │  ├─ product-delete-listener.ts
│  │  │  │  ├─ product-updated-listener.ts
│  │  │  │  ├─ queue-group-name.ts
│  │  │  │  └─ __test__
│  │  │  │     ├─ product-created-listener.test.ts
│  │  │  │     ├─ product-delete-listener.test.ts
│  │  │  │     └─ product-updated-listener.test.ts
│  │  │  └─ publishers
│  │  │     ├─ order-cancelled-publisher.ts
│  │  │     └─ order-created-publisher.ts
│  │  ├─ index.ts
│  │  ├─ models
│  │  │  ├─ order.ts
│  │  │  └─ product.ts
│  │  ├─ nats-wrapper.ts
│  │  ├─ routes
│  │  │  ├─ delete.ts
│  │  │  ├─ index.ts
│  │  │  ├─ new.ts
│  │  │  ├─ show.ts
│  │  │  └─ __test__
│  │  │     ├─ delete.test.ts
│  │  │     ├─ index.test.ts
│  │  │     ├─ new.test.ts
│  │  │     └─ show.test.ts
│  │  ├─ test
│  │  │  └─ setup.ts
│  │  └─ __mocks__
│  │     └─ nats-wrapper.ts
│  └─ tsconfig.json
├─ products
│  ├─ .dockerignore
│  ├─ Dockerfile
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ src
│  │  ├─ app.ts
│  │  ├─ events
│  │  │  ├─ listeners
│  │  │  │  ├─ order-cancelled-listener.ts
│  │  │  │  ├─ order-created-listener.ts
│  │  │  │  ├─ queue-group-name.ts
│  │  │  │  └─ __test__
│  │  │  │     ├─ order-cancelled-listener.test.ts
│  │  │  │     └─ order-created-listener.test.ts
│  │  │  └─ publishers
│  │  │     ├─ product-created-publisher.ts
│  │  │     ├─ product-deleted-publisher.ts
│  │  │     └─ product-updated-publisher.ts
│  │  ├─ index.ts
│  │  ├─ models
│  │  │  ├─ product.ts
│  │  │  └─ __test__
│  │  │     └─ product.test.ts
│  │  ├─ nats-wrapper.ts
│  │  ├─ routes
│  │  │  ├─ delete.ts
│  │  │  ├─ index.ts
│  │  │  ├─ new.ts
│  │  │  ├─ show.ts
│  │  │  ├─ update.ts
│  │  │  └─ __test__
│  │  │     ├─ delete.test.ts
│  │  │     ├─ index.test.ts
│  │  │     ├─ new.test.ts
│  │  │     ├─ show.test.ts
│  │  │     └─ update.test.ts
│  │  ├─ test
│  │  │  └─ setup.ts
│  │  └─ __mocks__
│  │     └─ nats-wrapper.ts
│  └─ tsconfig.json
├─ README.md
└─ skaffold.yaml

```