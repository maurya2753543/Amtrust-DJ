import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appRoundoffDecimal]'
})
export class RoundoffDecimalDirective implements OnInit {
  @Input() roundOffPlaces: number; // Required permission passed in
  constructor(private el: ElementRef, private control: NgControl) {
  }

  ngOnInit() {
    if (this.control && this.control.control && this.control.control.value && this.control.control.value != undefined) {
      const num: string = this.control.control.value;
      const numWithoutCommas = num.split(",").join("");
      this.control.control.setValue(Number(numWithoutCommas).toFixed(this.roundOffPlaces || 2));
    }
  }

  @HostListener('focusout') roundOffDecimal() {
    const num: string = this.control.control.value;
    const numWithoutCommas = num.split(",").join("");
    this.control.control.setValue(Number(numWithoutCommas).toFixed(this.roundOffPlaces || 2));
  }
}
