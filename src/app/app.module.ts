import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { DemoMaterialModule } from '../material-module';
import { MAT_DATE_LOCALE, MatFormFieldModule, MatIconModule, MatNativeDateModule, MatSelectModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { PolicyUploadsComponent } from './policy/policy-uploads/policy-uploads.component';
import { PolicyBatchSummaryComponent } from './policy/policy-batch-summary/policy-batch-summary.component';
import { CreatePolicyComponent } from './policy/create-policy/create-policy.component';
import { PolicyBatchExecutionHistoryComponent } from './policy/policy-batch-execution-history/policy-batch-execution-history.component';
import { ClaimUploadsComponent } from './claim/claim-uploads/claim-uploads.component';
import { ClaimBatchSummaryComponent } from './claim/claim-batch-summary/claim-batch-summary.component';
import { CreateClaimComponent } from './claim/create-claim/create-claim.component';
import { ClaimBatchExecutionHistoryComponent } from './claim/claim-batch-execution-history/claim-batch-execution-history.component';
import { ClaimSearchComponent } from './claim/claim-search/claim-search.component';
import { ClaimPendingComponent } from './claim/claim-pending/claim-pending.component';
import { ClaimDetailComponent } from './claim/claim-detail/claim-detail.component';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrModule } from 'ngx-toastr';
import { ScrollingModule, ScrollDispatchModule } from '@angular/cdk/scrolling';


import { FlexLayoutModule } from '@angular/flex-layout';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guard/auth.guard';
import { AppRoutingModule } from './app-routing.module';
import { HideUnauthorizedDirective } from './custom-directives/hide-unauthorized.directive';
import { DisableUnauthorizedDirective } from './custom-directives/disable-unauthorized.directive';
import { RoleMap } from './model/roles.map';
import { MatRadioModule } from '@angular/material/radio';
import { ProductListComponent } from './product/product-list.component';
import { ProductDetailComponent } from './product/product-detail.component';
import { PolicyListingComponent } from './policy/policy-listing/policy-listing.component';
import { PolicyDetailComponent } from './policy/policy-detail/policy-detail.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { RemoveUnderscorePipe } from './utility/removeUnderscorePipe';
import { BooleanPipe } from './utility/booleanPipe';
import { AmazingTimePickerModule } from 'amazing-time-picker';
import { RepairComponent } from './repair/repair.component';
import { ProductSearchComponent } from './product/product-search/product-search.component';
import { BnNgIdleService } from 'bn-ng-idle';
import { RoundoffDecimalDirective } from './custom-directives/roundoff-decimal.directive';
import { ActivityModule } from './activity/activity.module';
import { ConcurrentEditControlDirective } from './custom-directives/concurrent-edit-control.directive';
import { NotificationComponent } from './notification/notification.component';
import { AuditSearchComponent } from './audit/audit-search/audit-search.component';
import { AuditChangesComponent } from './audit/audit-changes/audit-changes.component';
import { ClientDevicesSearchComponent } from './product/client-devices/client-devices-search/client-devices-search.component';
import { PartnerOnboardingComponent } from './policy/partner-onboarding/partner-onboarding.component';
import { WebcamModule } from 'ngx-webcam';
import { MatDividerModule } from '@angular/material/divider';
import { PartnerLandingComponent } from './partner-landing/partner-landing.component';
import { DraftClaimDailogComponent } from './claim/create-claim/draft-claim-dailog/draft-claim-dailog.component';
import { ConfirmationDialogComponent } from './components/shared/confirmation-dialog/confirmation-dialog.component';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    PolicyUploadsComponent,
    PolicyBatchSummaryComponent,
    CreatePolicyComponent,
    PolicyBatchExecutionHistoryComponent,
    ClaimUploadsComponent,
    ClaimBatchSummaryComponent,
    CreateClaimComponent,
    ClaimBatchExecutionHistoryComponent,
    ClaimSearchComponent,
    ClaimPendingComponent,
    ClaimDetailComponent,
    LoginComponent,
    HideUnauthorizedDirective,
    DisableUnauthorizedDirective,
    ProductListComponent,
    ProductDetailComponent,
    PolicyListingComponent,
    PolicyDetailComponent,
    RemoveUnderscorePipe,
    BooleanPipe,
    RepairComponent,
    ProductSearchComponent,
    RoundoffDecimalDirective,
    ConcurrentEditControlDirective,
    ConfirmationDialogComponent,
    PartnerOnboardingComponent,
    AuditSearchComponent,
    AuditChangesComponent,
    ClientDevicesSearchComponent,
    PartnerLandingComponent,
    DraftClaimDailogComponent,
    NotificationComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    DemoMaterialModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    NgxPaginationModule,
    FlexLayoutModule,
    ActivityModule,
    MatRadioModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatDividerModule,
    NgxSpinnerModule,
    ScrollingModule,
    AmazingTimePickerModule,
    ActivityModule,
    ToastrModule.forRoot(),
    WebcamModule,
    ScrollDispatchModule
  ],
  entryComponents: [AppComponent, RepairComponent, ConfirmationDialogComponent, PartnerLandingComponent, NotificationComponent, DraftClaimDailogComponent],
  providers: [AuthGuard, BrowserAnimationsModule, RoleMap, BnNgIdleService, { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
  bootstrap: [AppComponent]
})
export class AppModule {
}
