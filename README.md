## About
Van Leeuwen Gulf is located in a Free Zone. In order to get duty expemtion for material exiting our yard, we need to justify how the material came in and meet a certain number of conditions:

The Reconciliation Database (RDB) has been designed to reconciliate bill of entry documents: 
- Make sure that the Qty, Net Weight, Gross Weight, HS Codes, and Description of material received talli with those of the material delivered.
- Make sure that the material is not being sold at a lesser price than it has been procured.

### How does it work

The Reconciliation Database (RDB) is divided into 2 sections: The Import and the Export section. Each section is composed of two screens. The first screen contains a list of each document and their respective status. The second screen contains the list of items composing the document. Above the list of each page, you will find buttons allowing you to perfom a list of action which we will detail later on.

### What are the advantages

1. Accessibility

   Having the information stored in one database and accessible via internet has a huge advantage: Employees can work simulteniously on different bill of entries, access and update information in real time.

2. Time Efficiency

   For convinience, the data can be uploaded from our ERP system via the download upload file. No need to type each line manually, simply download the GRN or Delivery Note from SAP system and upload it back to the portal. You can also generate  the Commercial Invoice, Delivery Advice, Summary Sheet as per Dubai Customs format in a click or a button.

3. Designed for the industry:

   ERP systems are great tools but have their limitations: Altrough it is possible to add the HS Codes / BOE numbers while preparing the  GRN, SAP does not keep track of the stock movements per BOE and remaining quantities. In the other hand, excel sheets are user friendly but become slow when we reach 100K rows, it is easy to misplace information and the document cannot be simultaneously modified by several users at the time... This web application has been designed to fill that gap.

## External links

* [WebApp](https://reconciliation-client.herokuapp.com/)
* [Manual](https://timpublic.s3.eu-west-3.amazonaws.com/manuals/rdbManual.pdf)

This web application has been developed for [Van Leeuwen Pipe and Tube Group](https://www.vanleeuwen.com/en/).

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See the [deployment](https://github.com/Sampaguitas/pdb_client/blob/master/README.md#deployment) section to deploy your app on Heroku.

### Prerequisites

You will need to install [nodejs](https://nodejs.org/en/) and [gitbash](https://git-scm.com/downloads) (to execute git commands if you are running on windows).

Make sure that you have already set up the back_end of this app: [https://github.com/Sampaguitas/reconciliation_server](https://github.com/Sampaguitas/reconciliation_server).

### Installing

Clone this repository:

```
$ git clone https://github.com/Sampaguitas/reconciliation_client.git
```

Install all dependencies:

```
$ npm install
```
In your **webpack.config.js** file, under externals: change 'https://reconciliation-server.herokuapp.com' with the address of your back_end application. This will allow your front_end to make API calls to your back_end application once deployed.

```
externals: {
   config: JSON.stringify({
      apiUrl: process.env.NODE_ENV === 'dev' ? 'http://localhost:5000' : 'https://reconciliation-server.herokuapp.com',
      version: require('./package.json').version
   })
},
```

Run the app:

```
$ npm run dev
```
If everithing whent well, you should see the following logs in your terminal:

![alt text](https://vanleeuwenpublic.s3.eu-west-3.amazonaws.com/setup/bundling.png "boundling")

Now clear the git info with the following command:

```
git init
```

And push your application to a new Git repo... 

## Deployment

While setting up the back_end, we have created a pipeline in Heroku and two applications:

![alt text](https://vanleeuwenpublic.s3.eu-west-3.amazonaws.com/setup/staging.png "staging")

Click on your front_end application and under the deploy tab, click on use github (then link it to your git repo):

![alt text](https://vanleeuwenpublic.s3.eu-west-3.amazonaws.com/setup/use+github.png "use github")

We do not have config vars to be set for the front_end application.

## Built With

* [node.js](https://nodejs.org/en/) - JavaScript runtime
* [npm](https://www.npmjs.com) - Dependency Management
* [react](reactjs.org) - The web framework used
* [redux](https://redux.js.org/) - Predictable container for application state

This application contains 71 files and 18,821 lines of code (27,897 including back_end).

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details about our code of conduct and how to submit pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/Sampaguitas/reconciliation_client/tags). 

## Authors

**Timothee Desurmont** - *Business Development Manager* - [View profile](https://www.linkedin.com/in/timothee-desurmont-82243245/)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
