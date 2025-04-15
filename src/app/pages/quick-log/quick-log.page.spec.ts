import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuickLogPage } from './quick-log.page';

describe('QuickLogPage', () => {
  let component: QuickLogPage;
  let fixture: ComponentFixture<QuickLogPage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(QuickLogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});