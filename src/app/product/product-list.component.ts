import { Component, OnInit } from '@angular/core';
import { IProduct } from './product';
import { ProductService } from './product.service';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductSearchCriteria } from 'src/app/model/product.search';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  errorMessage: string;
  products: IProduct;
  panelOpenState = false;
  search: ProductSearchCriteria;

  constructor(
    private productService: ProductService,
    private location: Location,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }


  ngOnInit(): void {
    this.products = window.history.state[0];
    console.log(this.products);

    this.search = window.history.state[1];
    if (this.search) {
      this.search.currentPage = window.history.state[2];
    }

    window.scroll(0, 0);
  }

  goBack() {
    this.router.navigate(['../', this.search], { relativeTo: this.route });
  }
}
