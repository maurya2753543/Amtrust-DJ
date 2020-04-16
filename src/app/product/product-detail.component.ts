import {Component, OnInit} from '@angular/core';
import {ProductService} from './product.service';
import {IProduct} from './product';
import {ActivatedRoute} from '@angular/router';

@Component({
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: IProduct;

  pageTitle: string = 'Product details';
  noDetail: string = 'There is no detail about this customer';
  errorMessage: string;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {
  }

  ngOnInit(): void {
    this.getProduct();
  }

  getProduct(): void {
    const id = +this.route.snapshot.paramMap.get('id');
    this.pageTitle += `: ${id}`;

    this.productService
      .getProduct(id)
      .subscribe(product => (this.product = product));
  }
}
