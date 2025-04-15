import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddLivestockPage } from './add-livestock.page';

describe('AddLivestockPage', () => {
  let component: AddLivestockPage;
  let fixture: ComponentFixture<AddLivestockPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddLivestockPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
