export class ProductDetail {
  productName: string;
  productCode: string;
  desciption: string;
  clientProductDesciption: string;
  clientProductName: string;
  tenure: string;
  termsAndConditions: string;
  partnerProductId: Number;


  static newProductDetail(): ProductDetail {
    const productDetailObj: ProductDetail = new ProductDetail();
    return productDetailObj;
}

}
