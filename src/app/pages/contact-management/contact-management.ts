
import { Component, OnInit, inject ,ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ContactService } from '../../services/contact';
import { Contact } from '../../models/contact';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-contact-management',
  standalone: true,
  imports: [CommonModule, FormsModule,ReactiveFormsModule],
  templateUrl: './contact-management.html',
  styleUrl: './contact-management.scss'
})
export class ContactManagement implements OnInit {

  private contactService = inject(ContactService);
  private cdr = inject(ChangeDetectorRef);

  contacts: Contact[] = [];
  searchTerm: string = '';

  loading: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
    this.loadContacts();
  }

 loadContacts(): void {
  this.loading = true;
  this.errorMessage = '';

  this.contactService.getContacts().subscribe({
    next: (data) => {
      this.contacts = data;
      this.loading = false;

      this.cdr.markForCheck();
    },
    error: (error) => {
      console.error('Error loading contacts:', error);

      this.errorMessage = 'Failed to load contacts';
      this.loading = false;

      this.cdr.markForCheck();
    }
  });
}


get filteredContacts(): Contact[] {
  const search = this.searchTerm.trim().toLowerCase();

  if (!search) {
    return this.contacts;
  }

  return this.contacts.filter(contact => {
    const firstName = String(contact.first_name ?? '').trim();
    const lastName = String(contact.last_name ?? '').trim();

    const fullName = `${firstName} ${lastName}`
      .replace(/\s+/g, ' ')
      .toLowerCase();

    const searchableText = [
      firstName,
      lastName,
      fullName,
      contact.emailId,
      contact.mobilenumber,
      contact.gender,
      contact.age
    ]
      .map(value => String(value ?? '').toLowerCase())
      .join(' ');

    return searchableText.includes(search);
  });
}




private fb = inject(FormBuilder);

showForm = false;
saving = false;
formError = '';
successMessage = '';

contactForm = this.fb.nonNullable.group({
  first_name: ['', Validators.required],
  last_name: ['', Validators.required],
  emailId: ['', [Validators.required, Validators.email]],
  age: [18, [Validators.required, Validators.min(1), Validators.max(120)]],
  gender: ['', Validators.required],
  mobilenumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
  pan_no: ['', [
    Validators.required,
    Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/)
  ]],
  adhaar_no: ['', [
    Validators.required,
    Validators.pattern(/^[0-9]{12}$/)
  ]],
  status: [true]
});

openAddForm(): void {
  this.editingContactId = null;
  this.contactForm.reset({
    first_name: '',
    last_name: '',
    emailId: '',
    age: 18,
    gender: '',
    mobilenumber: '',
    pan_no: '',
    adhaar_no: '',
    status: true
  });

  this.formError = '';
  this.showForm = true;
}

closeForm(): void {
  this.showForm = false;
  this.formError = '';
}


saveContact(): void {
  if (this.contactForm.invalid) {
    this.contactForm.markAllAsTouched();
    return;
  }

  const values = this.contactForm.getRawValue();

  const contact: Contact = {
    createdAt: new Date().toISOString(),
    first_name: values.first_name.trim(),
    last_name: values.last_name.trim(),
    emailId: values.emailId.trim(),
    age: values.age,
    gender: values.gender,
    mobilenumber: Number(values.mobilenumber),
    pan_no: values.pan_no.trim().toUpperCase(),
    adhaar_no: values.adhaar_no.trim(),
    status: values.status
  };

  this.saving = true;
  this.formError = '';

  const isEditing = this.editingContactId !== null;

  const request$ = isEditing
    ? this.contactService.updateContact(this.editingContactId!, {
        ...contact,
        createdAt:
          this.contacts.find(c => c.id === this.editingContactId)?.createdAt
          ?? contact.createdAt
      })
    : this.contactService.addContact(contact);

  request$.subscribe({
    next: () => {
      this.saving = false;
      this.showForm = false;
      this.editingContactId = null;

      this.successMessage = isEditing
        ? 'Contact updated successfully!'
        : 'Contact added successfully!';

      this.loadContacts();
    },
    error: (error) => {
      console.error('Save Contact Error:', error);

      this.saving = false;
      this.formError = isEditing
        ? 'Failed to update contact. Please try again.'
        : 'Failed to add contact. Please try again.';
    }
  });
}



editingContactId: string | null = null;


editContact(contact: Contact): void {
  if (!contact.id) {
    this.errorMessage = 'Contact ID not found.';
    return;
  }

  this.editingContactId = contact.id;
  this.formError = '';
  this.successMessage = '';

  this.contactForm.patchValue({
    first_name: contact.first_name,
    last_name: contact.last_name,
    emailId: contact.emailId,
    age: contact.age,
    gender: contact.gender,
    mobilenumber: String(contact.mobilenumber),
    pan_no: contact.pan_no,
    adhaar_no: contact.adhaar_no,
    status: contact.status
  });

  this.showForm = true;
}


contactToDelete: Contact | null = null;
deleting = false;


openDeleteDialog(contact: Contact): void {
  this.contactToDelete = contact;
  this.errorMessage = '';
}

closeDeleteDialog(): void {
  if (this.deleting) return;
  this.contactToDelete = null;
}

confirmDelete(): void {
  if (!this.contactToDelete?.id || this.deleting) {
    return;
  }

  const id = this.contactToDelete.id;

  this.deleting = true;
  this.errorMessage = '';
  this.successMessage = '';

  this.contactService.deleteContact(id).subscribe({
    next: () => {
      this.contacts = this.contacts.filter(
        contact => contact.id !== id
      );

      this.deleting = false;
      this.contactToDelete = null;
      this.successMessage = 'Contact deleted successfully!';

      this.loadContacts();
    },
    error: (error) => {
      console.error('DELETE API Error:', error);

      this.deleting = false;
      this.contactToDelete = null;
      this.errorMessage =
        'Failed to delete contact. Please try again.';
    }
  });
}


selectedContact: Contact | null = null;
viewLoading = false;
viewError = '';



viewContact(contact: Contact): void {
  if (!contact.id) return;

  this.selectedContact = null;
  this.viewLoading = true;
  this.viewError = '';

  this.cdr.markForCheck();

  this.contactService.getContactById(contact.id).subscribe({
    next: (data) => {
      console.log('View Contact API Response:', data);

      this.selectedContact = data;
      this.viewLoading = false;
      this.viewError = '';

      this.cdr.markForCheck();
    },
    error: (error) => {
      console.error('View Contact Error:', error);

      this.viewLoading = false;
      this.viewError = 'Failed to load contact details';

      this.cdr.markForCheck();
    }
  });
}

closeView(): void {
  this.selectedContact = null;
  this.viewError = '';
  this.viewLoading = false;
}



onPanInput(event: Event): void {
  const input = event.target as HTMLInputElement;

  const value = input.value.toUpperCase();

  this.contactForm.controls.pan_no.setValue(value, {
    emitEvent: false
  });

  input.value = value;
}


}
