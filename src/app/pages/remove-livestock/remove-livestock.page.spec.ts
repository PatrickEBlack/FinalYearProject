import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RemoveLivestockPage } from './remove-livestock.page';

describe('RemoveLivestockPage', () => {
  let component: RemoveLivestockPage;
  let fixture: ComponentFixture<RemoveLivestockPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoveLivestockPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
