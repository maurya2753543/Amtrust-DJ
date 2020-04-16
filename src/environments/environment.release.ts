// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  repairUrl: 'https://crm-release.amtrust.asia:8084/',
  policyUrl: 'https://crm-release.amtrust.asia:8082/',
  claimUrl: 'https://crm-release.amtrust.asia:8086/api/claim/',
  identityUrl: 'https://crm-release.amtrust.asia:8081/',
  productUrl: 'https://crm-release.amtrust.asia:8083/productapi/',
  s3ObjUrl: 'https://samsung-crm.s3-ap-southeast-1.amazonaws.com/claim/',
  activityUrl: 'https://crm-release.amtrust.asia:8998/activity/',
  lockUrl: 'https://crm-release.amtrust.asia:8092/lock/',
  mdmUrl: 'https://crm-uat.amtrust.asia:8700/api/v1',
  newDeviceDigi: 'https://docs.google.com/forms/d/e/1FAIpQLSd7MDe0C57crSVWcm7Twr48mcWzLjrSS6alJrRo5q78IKg0ww/viewform',
  terminationDigi: 'https://docs.google.com/forms/d/e/1FAIpQLScggUTvwmipPFVkvp_ukUysPnKENuYpKI9QDqewtfq3-SSk9A/viewform'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
