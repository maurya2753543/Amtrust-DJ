export class BatchExecutionHistorySearchCRiteria {
    pageIndex: number = 0;
    pageRecordCount: number = 10;
    selectedPartnerId : any;
    static BatchExecutionHistorySearchCRiteria(): BatchExecutionHistorySearchCRiteria {
        return new BatchExecutionHistorySearchCRiteria();
      }
}