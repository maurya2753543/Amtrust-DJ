import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PolicyUploadsComponent } from './policy/policy-uploads/policy-uploads.component';
import { PolicyBatchSummaryComponent } from './policy/policy-batch-summary/policy-batch-summary.component';
import { CreatePolicyComponent } from './policy/create-policy/create-policy.component';
import { PolicyBatchExecutionHistoryComponent } from './policy/policy-batch-execution-history/policy-batch-execution-history.component';
import { CreateClaimComponent } from './claim/create-claim/create-claim.component';
import { ClaimSearchComponent } from './claim/claim-search/claim-search.component';
import { ClaimPendingComponent } from './claim/claim-pending/claim-pending.component';
import { ClaimBatchExecutionHistoryComponent } from './claim/claim-batch-execution-history/claim-batch-execution-history.component';
import { ClaimDetailComponent } from './claim/claim-detail/claim-detail.component';
import { LoginComponent } from './login/login.component';
import { PolicyListingComponent } from './policy/policy-listing/policy-listing.component';
import { ProductListComponent } from './product/product-list.component';
import { ProductDetailComponent } from './product/product-detail.component';
import { PolicyDetailComponent } from './policy/policy-detail/policy-detail.component';
import { ProductSearchComponent } from './product/product-search/product-search.component';
import { AuditSearchComponent } from './audit/audit-search/audit-search.component';
import { AuditChangesComponent } from './audit/audit-changes/audit-changes.component';
import { HomeComponent } from './home/home.component';
import { AppRoutingConstants } from './app-routing.constants';



const routes: Routes = [
  { path: AppRoutingConstants.APP_LOGIN, component: LoginComponent, outlet: 'loginRouter' },
  { path: AppRoutingConstants.APP_LOGIN_DEFAULT, component: LoginComponent, outlet: 'loginRouter' },
  { path: AppRoutingConstants.HOME, component: HomeComponent },
  { path: AppRoutingConstants.POLICY_UPLOAD, component: PolicyUploadsComponent },
  { path: AppRoutingConstants.POLICY_BATCH_SUMMARY, component: PolicyBatchSummaryComponent },
  { path: AppRoutingConstants.POLICY_CREATE, component: CreatePolicyComponent },
  { path: AppRoutingConstants.POLICY_SEARCH, component: PolicyListingComponent },
  { path: AppRoutingConstants.POLICY_BATCH_HISTORY, component: PolicyBatchExecutionHistoryComponent },
  { path: AppRoutingConstants.POLICY_DETAIL, component: PolicyDetailComponent },
  { path: AppRoutingConstants.CLAIM_SEARCH, component: ClaimSearchComponent },
  { path: AppRoutingConstants.CLAIM_SEARCH_BY_PARAMETERS, component: CreateClaimComponent },
  { path: AppRoutingConstants.CLAIM_DETAIL, component: CreateClaimComponent },
  { path: 'claim/pending', component: ClaimPendingComponent },
  { path: 'claim/pending/detail', component: ClaimDetailComponent },
  { path: 'claim/batch/history', component: ClaimBatchExecutionHistoryComponent },
  { path: 'products', component: ProductListComponent },
  { path: "productsearch/details", component: ProductListComponent },
  { path: "productsearch", component: ProductSearchComponent },
  { path: 'products/:productCode', component: ProductDetailComponent },
  { path: 'audit', component: AuditSearchComponent },
  { path: 'audit/changes', component: AuditChangesComponent },

];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes, { useHash: true })]
})
export class AppRoutingModule {
}
