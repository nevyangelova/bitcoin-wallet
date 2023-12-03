# Custodial Wallet App

## Introduction

This custodial wallet application allows users to securely manage their Bitcoin and bank accounts. It integrates with Plaid for bank connections and offers functionalities such as account linking, balance viewing, and Bitcoin transactions.

## Prerequisites

Before starting, ensure you have the following installed:

-   Node.js
-   Yarn package manager
-   Bitcoin Core (for running a regtest node)
-   A Plaid account (for sandbox testing)

## Setup Instructions

### Clone the Repository

Clone the repository to your local machine:

```
git clone [repository URL]
cd [repository directory]
```

### Setup Bitcoin Core

Configure your local Bitcoin Core node to run in regtest mode. Follow the settings specified in bitcoinClient.js. Ensure your bitcoin.conf file is set up accordingly.

### Running Tests

Run the following command to execute tests for both frontend and backend:

`yarn test`

### Start the Backend Server

Run the Node.js server:

```
cd backend
yarn
node index.js
```

### Start the Frontend Application

Navigate to the frontend directory, install dependencies, and start the application:

```
cd ../frontend
yarn install
yarn start
```

### Connect to Plaid

Sign up as a test user with username, password and name.
Use the Plaid sandbox for testing:

`Username: user_good`
`Password: user_good`

Follow the on-screen instructions to connect your bank accounts via Plaid.
Once your accounts are connected, you can try purchasing Bitcoin from your selected bank account.

## Trade-offs

### Deployment and Configuration

Due to time constraints, the solution is not deployed, requiring users to configure a testnet Bitcoin connection locally.

### Testing

Component tests are not comprehensive and need to be expanded to cover more scenarios and edge cases.

### Refactoring

Ongoing refactoring is in progress to improve code quality and maintainability.
