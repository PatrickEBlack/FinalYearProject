import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MonitorPage } from './monitor.page';

describe('MonitorPage', () => {
  let component: MonitorPage;
  let fixture: ComponentFixture<MonitorPage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(MonitorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});