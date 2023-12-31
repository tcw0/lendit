# lendit

Client-server application for _lendit_.

> lendit is the ultimate peer-to-peer sharing platform to help lenders and renters monetize unused tools or equipment and gain short-term access to affordable items by connecting a like-minded local community.

## Project Management

Task management is done via [Linear](https://linear.app/lendit).

## Project Structure

This project structure focuses on the most important files in this project.

```
.
├── README.md
├── .gitlab                 -> gitlab PR templates
├── .husky                  -> pre-commit hooks
├── api
│   ├── generated           -> Autogenerated models and client (do not touch)
│   └── src                 -> Swagger YAML
├── client
│   ├── node_modules        -> installed node modules (do not touch)
│   └── src
│       ├── assets          -> assets such as images & logos
│       ├── components      -> common components
│       ├── context         -> contexts for sharing global state accross the application
│       ├── helper          -> helper functions
│       └── pages           -> individual pages
└── server
    ├── node_modules        -> installed node modules (do not touch)
    ├── local_db_data       -> data saved in the database (do not touch)
    └── src
        ├── assets          -> assets such as mail templates
        ├── config          -> configuration files for db, mail, and AWS S3 bucket
        ├── controllers     -> implementation of controllers serving the routes (error handling & building response)
        ├── middleware      -> middleware handling errors, logging, and authentication
        ├── models          -> model
        ├── routes          -> individual routes
        ├── services        -> implementation of the business logic
        └── server.ts

```

## Project Setup

### NodeJS

Install NodeJS on your machine. It is recommended to use [NVM (hombrew)](https://medium.com/devops-techable/how-to-install-nvm-node-version-manager-on-macos-with-homebrew-1bc10626181).
Use Node version 18: `nvm use 18.16.0`

### Database

We recommend to not use the local database for development, but rather use the managed database. This can be done by setting the environment variable `MONGODB_MODE=REMOTE` in the `.env` file in the `server` directory.

In order to run the local database, Docker needs to be installed. After starting docker for the first time, docker-compose is automatically made available. The database can be started by opening the `server` directory and enter `yarn start:db`. The data will be saved in the `data` directory (part of .gitignore). To stop the database, enter `yarn stop:db`.

It is not necessary to run `yarn start:db` and `yarn stop:db` if you use the managed database in the cloud.

### Yarn

We use yarn as a package manager. To install yarn, run `npm install --global yarn` or use [Homebrew](https://brew.sh/) and run `brew install yarn`.

Thus new dependencies are added through `yarn add <package>` and `yarn add --dev <package>` for dev dependencies.

### Environmnet variables

An example of the necessary environment variables can be found in `.env.example` in `server` and `client`.
The secrets are shared on demand. Reach out to one of the maintainers of the project to get access to the secrets.

The following environment variables are necessary to run the application:

`server`

- `PORT`: port on which the server is running
- `MONGODB_URLLOCAL`: local connection string to the database
- `MONGODB_URLREMOTE`: remote connection string to the database
- `MONGO_INITDB_ROOT_USERNAME`: username for the local database
- `MONGO_INITDB_ROOT_PASSWORD`: password for the local database
- `MONGODB_MODE`: mode of the database (LOCAL or REMOTE)
- `SECRET_KEY`: secret key for JWT token generation
- `AWS_ACCESS_KEY_ID`: access ID for AWS S3 bucket (used for image upload)
- `AWS_SECRET_ACCESS_KEY`: secret key for AWS S3 bucket (used for image upload)
- `AWS_REGION`: region of AWS S3 bucket (used for image upload)
- `AWS_BUCKET_NAME`: name of AWS S3 bucket (used for image upload)
- `MAIL_API_KEY`: API key for SIB mail service (used for sending emails)
- `FRONTEND_URL`: URL of a running frontend (used for sending emails and providing correct links)
- `STRIPE_PUB_KEY`: public key for stripe (used for payment)
- `STRIPE_SECRET_KEY`: secret key for stripe (used for payment)

`client`

- `VITE_PROXY_API_URL`: proxy for vite server (not necessary)
- `VITE_MAPBOX`: private key for mapbox (used for map integration)
- `VITE_MAPS_API`: api key for google maps (used for location search)
- `VITE_STRIPE_PUB_KEY`: public key for stripe (used for payment)

## Get started

### Run application

1. Clone respository using `git clone: https://gitlab.lrz.de/seba-master-2023/team-18/lendit.git`
2. Rename the `.env.example` file in `/server` to `.env`
3. Frontend:
   1. Move to the client folder using `cd client`
   2. Install the necessary dependencies using `yarn install`
   3. Start the client using `yarn dev`
4. Backend:
   1. Move to the server folder using `cd client`
   2. Install the necessary dependencies using `yarn install`
   3. Start the server using `yarn dev`

### Use lendit

**Create new user**

We encourage you to create a user for yourself to test out functionality that only occurs after creating a new user such as:
 - Address autocomplete using Google API on Signup
 - E-Mail verification before Login
 - Complete profile dialog after first login
 - Upload suggestions after first login


**Test User**

To interact with an existing user, you can login with the following credentials:
- **E-Mail:** sicherer_singulett.0u@icloud.com
- **Password:** 1234

**Payment**

As we are using a test account for Stripe, we can only use test credit cards. Working test credit card numbers can be found in the [Stripe Documentation](https://stripe.com/docs/testing#cards).
- **Card Number**: 4242 4242 4242 4242
- **Expiration Date**: Any future date
- **CVC**: Any 3 digits	


**Mail**

Some e-mail providers block e-mails from SendInBlue if displayed sender and actual sender do not match. We tested with t-online & gmail. For @tum emails, it may arrive in the spam or get filtered out completely. In a production environment, we would buy and use a custom domain for the sender address so that this problem does not occur.


**API-Spec**

The api is specified using swagger. The swagger documentation can be found at `http://localhost:8080/api-spec/` when the server is running (on port 8080, otherwise change the port). The client code of the api is autogenerated and can be found in `api/generated`. This allows for easy adoption of the api in the client.