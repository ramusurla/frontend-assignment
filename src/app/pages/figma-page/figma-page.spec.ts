import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FigmaPage } from './figma-page';

describe('FigmaPage', () => {
  let component: FigmaPage;
  let fixture: ComponentFixture<FigmaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FigmaPage],
    }).compileComponents();

    fixture = TestBed.createComponent(FigmaPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
