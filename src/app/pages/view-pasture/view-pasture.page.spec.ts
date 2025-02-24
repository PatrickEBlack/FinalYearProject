import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewPasturePage } from './view-pasture.page';

describe('ViewPasturePage', () => {
  let component: ViewPasturePage;
  let fixture: ComponentFixture<ViewPasturePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewPasturePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
