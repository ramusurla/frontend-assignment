
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';

@Component({
  selector: 'app-figma-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './figma-page.html',
  styleUrl: './figma-page.scss'
})
export class FigmaPage {

  // Header Section
  imageUrl: string = '';
  videoUrl: string = '';
  documentUrl: string = '';

  latitude: number | null = null;
  longitude: number | null = null;

  // Message Section
  variable1: string = '';
  variable2: string = '';

  dropdownOpen: boolean = true;
  variableSearch: string = '';

  activeTab: 'Standard' | 'Custom' = 'Standard';

  standardVariables: string[] = [
    'First Name',
    'Last Name',
    'Address',
    'City',
    'Country',
    'Gender'
  ];

 
  customVariables: string[] = [
    'Customer ID',
    'Order ID',
    'Order Date',
    'Company Name'
  ];


  payloadFields = [
    {
      key: 'yes',
      label: '"Yes" button payload',
      value: ''
    },
    {
      key: 'no',
      label: '"No" button payload',
      value: ''
    },
    {
      key: 'unsubscribe',
      label: '"Unsubscribe" button payload',
      value: ''
    },
    {
      key: 'website',
      label: '"Visit website" URL parameter',
      value: ''
    }
  ];

  constructor(private location: Location) {}

  get filteredVariables(): string[] {
    const variables =
      this.activeTab === 'Standard'
        ? this.standardVariables
        : this.customVariables;

    return variables.filter(variable =>
      variable
        .toLowerCase()
        .includes(this.variableSearch.trim().toLowerCase())
    );
  }

  addVariable(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

 
  selectVariable(variable: string): void {
    this.variable2 = `{{${variable}}}`;
    this.dropdownOpen = false;
  }

  goBack(): void {
    this.location.back();
  }

 
  resetForm(): void {
    this.imageUrl = '';
    this.videoUrl = '';
    this.documentUrl = '';

    this.latitude = null;
    this.longitude = null;

    this.variable1 = '';
    this.variable2 = '';

    this.variableSearch = '';
    this.dropdownOpen = false;
    this.activeTab = 'Standard';

    this.payloadFields.forEach(field => {
      field.value = '';
    });
  }


  isValidUrl(value: string): boolean {
    if (!value.trim()) {
      return true;
    }

    try {
      const url = new URL(value);
      return url.protocol === 'http:' ||
             url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  
  submitForm(): void {

    if (!this.isValidUrl(this.imageUrl)) {
      alert('Please enter a valid Image URL.');
      return;
    }

    if (!this.isValidUrl(this.videoUrl)) {
      alert('Please enter a valid Video URL.');
      return;
    }

    if (!this.isValidUrl(this.documentUrl)) {
      alert('Please enter a valid Document URL.');
      return;
    }

    if (
      this.latitude !== null &&
      (this.latitude < -90 || this.latitude > 90)
    ) {
      alert('Latitude must be between -90 and 90.');
      return;
    }

    if (
      this.longitude !== null &&
      (this.longitude < -180 || this.longitude > 180)
    ) {
      alert('Longitude must be between -180 and 180.');
      return;
    }

    const formData = {
      templateName: 'Diwali Sale',
      templateId: '5796525814953',
      messageType: 'Text and Rich Media',
      language: 'English',

      header: {
        imageUrl: this.imageUrl,
        videoUrl: this.videoUrl,
        documentUrl: this.documentUrl,
        latitude: this.latitude,
        longitude: this.longitude
      },

      message: {
        variable1: this.variable1,
        variable2: this.variable2
      },

      buttons: this.payloadFields.reduce(
        (result, field) => {
          result[field.key] = field.value;
          return result;
        },
        {} as Record<string, string>
      )
    };

    console.log('Message Form Data:', formData);

    alert('Message composed successfully!');
  }
}
