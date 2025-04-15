import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddToPasturePage } from './add-to-pasture.page';

describe('AddToPasturePage', () => {
  let component: AddToPasturePage;
  let fixture: ComponentFixture<AddToPasturePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddToPasturePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
