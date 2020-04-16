import { WebcamImage } from 'ngx-webcam';

/**
 * Policy module model data
 */
export class PolicyDocument {
    custAddress?: any;
    coverage?: string;
    clientProductDescription?;
    //Client Transaction Number
    clientTransactionNo?: string;
    //Policy Sold Date
    policyPurchaseDate?: string;
    //SKU of AMS product. E.g. Product name by Brand
    productName?: string;
    //Customer Name
    customerName?: string;
    //Customer Identification Number (IC/Passport)
    custIdNumber?: string;
    //Mobile number with country code (no +,-,spaces)
    custMobileNumber?: string;
    //Customer Email
    customerEmail?: string;
    //Customer Address

    //Customer City
    customerCity?: string;
    //Store Code
    storeCode?: string;
    //Store Name
    storeName?: string;
    //Store Address
    storeAddress?: string;
    //Store City
    storeCity?: string;
    //Sales Representative Id
    salesRepId?: string;
    // Sales Representative Name
    salesRepName?: string;
    //Device Retail Price
    deviceRRP?: string;
    //Balance RRP
    balanceRRP?: string;
    //Device Type covered Under Policy
    deviceType?: string;
    //Device Make
    deviceMake?: string;
    //Device Model
    deviceModel?: string;
    //Device Color
    deviceColor?: string;
    //Policy IMEI Number
    policyIMEINumber?: string;
    //Product Type For Which Policy Is Purchased
    nameGoodsType?: string;
    //Policy Start Date
    policyStartDate?: string;
    //Policy End Date
    policyEndDate?: string;
    //Device Policy Sum Assured value
    deviceValueSumAssured?: string;
    //Policy Validation Failure Logs
    validationFailuresLogs?: any;
    // Who updated?
    updatedBy?: string;
    productsModel?: any;
    policyStatus?: string;
    policyNumber?: string;
    policyTenure?: string;
    customerLastName?: string;
    countryCode?: string;
    deviceSoldDate?: string;
    partnerId?: string;
    clientKey?: string;
    partnerProductId?: string;
    partnerContractId?: string;
    creationDate?: string;
    createdBy?: string;
    orderId?: string;
    deviceMemory?: string;
    custPostalCode?: string;
    customerState?: string;
    deviceSerialNo?: string;
    storeState?: string;
    storePromotion?: string;
    deviceCapacity?: string;
    invoiceNo?: string;
    ecertUrl?: string;
    idType?: string;
    postalCode?: string;
    deviceFrontImage? : string;
    deviceBackImage? : string;
    selectedProdcutTenure? : string;
    selectedProductDescription? :string;
    selectedProductTermsAndConditions? :string;
    internalProductId? :string;



    static newPolicyDocument(): PolicyDocument {
        const policyDocumentObj: PolicyDocument = new PolicyDocument();
        return policyDocumentObj;
    }
}
