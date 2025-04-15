import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageLivestockPage } from './manage-livestock.page';

describe('ManageLivestockPage', () => {
  let component: ManageLivestockPage;
  let fixture: ComponentFixture<ManageLivestockPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageLivestockPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
