import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewLivestockPage } from './view-livestock.page';

describe('ViewLivestockPage', () => {
  let component: ViewLivestockPage;
  let fixture: ComponentFixture<ViewLivestockPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewLivestockPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
