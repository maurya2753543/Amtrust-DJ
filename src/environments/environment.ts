// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  repairUrl: 'https://crm-uat.amtrust.asia:8084/',
  //'http://localhost:8084/',
  policyUrl: 'https://crm-uat.amtrust.asia:8082/',
  //  'http://localhost:8080/',
  claimUrl: 'https://crm-uat.amtrust.asia:8086/api/claim/',
  //'http://localhost:8080/api/claim/',
  websocketUrl: 'https://crmzalbuat.amtrust.asia:8086/api/claim/',
  // 'https://crm-uat.amtrust.asia:8086/api/claim/',
  identityUrl: 'https://crm-uat.amtrust.asia:8081/',
  productUrl: 'https://crm-uat.amtrust.asia:8083/productapi/',
  //'http://localhost:8083/productapi/',
  s3ObjUrl: 'https://samsung-crm.s3-ap-southeast-1.amazonaws.com/claim/',
  activityUrl: 'https://crm-uat.amtrust.asia:8998/activity/',
  lockUrl: 'https://crm-uat.amtrust.asia:8092/lock/',
  mdmUrl: 'https://crm-uat.amtrust.asia:8700/api/v1',
  //'http://localhost:8080/api/v1',
  newDeviceDigi: 'https://docs.google.com/forms/d/e/1FAIpQLSd7MDe0C57crSVWcm7Twr48mcWzLjrSS6alJrRo5q78IKg0ww/viewform',
  terminationDigi: 'https://docs.google.com/forms/d/e/1FAIpQLScggUTvwmipPFVkvp_ukUysPnKENuYpKI9QDqewtfq3-SSk9A/viewform',
  // flowableTaskUrl: 'http://localhost:8080/http://localhost:9999/flowable-task/', // Local
  // flowableTaskUrl: 'https://cors-anywhere.herokuapp.com/http://flowabledev.amtrust.asia:9999/flowable-task/process-api/runtime/', // Dev
  flowableTaskUrl: 'https://cors-anywhere.herokuapp.com/http://flowable-uat.amtrust.asia:9999/flowable-task/', // UAT
  flowableAppDefinitionKey: 'process'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
