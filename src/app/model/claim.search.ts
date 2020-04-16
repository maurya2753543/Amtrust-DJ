export interface ClaimSearch {
    policyNo: string;
    claimNo: string;
    customerName: string;
    imei: string;
    customerEmail: string;
    customerId: string;
    customerContact: string;
    statusCode: string;
    subStatusCode: string;
    client: string;
    country: string;
    partnerId:string
    currentPage: Number
    listOfAssignees : any
    assigneesSearched : any
    searchedAssigneeCodes : string []
    dateCreated : string,
    pageIndex : number;
    pageRecordCount : number;
}
