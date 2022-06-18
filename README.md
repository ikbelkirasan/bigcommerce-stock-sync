# BigCommerce Stock Sync

This app is used with a custom Zapier app to sync stock via a CSV file.

## Setup

1. Click on the deploy button below to start the installation:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/ikbelkirasan/bigcommerce_bulk_updates_heroku_app/tree/master)

2. Input a unique name in the **App Name** field.
3. Choose a region.
4. Provide the following environment variables:

| Variable                   | Description                                                                                        |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| `BIGCOMMERCE_STORE_HASH`   | Your Bigcommerce Store hash                                                                        |
| `BIGCOMMERCE_ACCESS_TOKEN` | Your Bigcommerce Access Token                                                                      |
| `QUEUE_SECRET_KEY`         | UUID v4 secret key for the queue. Can be generated [here](https://www.uuidgenerator.net/version4). |

5. Click on **Deploy app** to start the deployment.
6. Once done, click on **Manage App**.
7. On the dashboard, right click on the **Open app** button and copy the deployment URL.
8. Reconnect your Bigcommerce Zapier app with the deployment URL.

That's it. Everything should be ready to go.
