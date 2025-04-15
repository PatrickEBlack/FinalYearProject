import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModifyPasturePage } from './modify-pasture.page';

describe('ModifyPasturePage', () => {
  let component: ModifyPasturePage;
  let fixture: ComponentFixture<ModifyPasturePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyPasturePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
