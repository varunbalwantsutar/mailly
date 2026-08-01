import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import prisma from '../config/db.js';

// GET /api/contacts
export const getContacts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id!;
    const search = req.query.search as string;
    const status = req.query.status as string;

    const whereClause: any = { userId };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    const contacts = await prisma.contact.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ contacts });
  } catch (error: any) {
    console.error('getContacts error:', error);
    return res.status(500).json({ error: 'Failed to retrieve contacts' });
  }
};

// GET /api/contacts/:id
export const getContactById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id!;
    const { id } = req.params;

    const contact = await prisma.contact.findFirst({
      where: { id, userId },
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    return res.status(200).json({ contact });
  } catch (error) {
    console.error('getContactById error:', error);
    return res.status(500).json({ error: 'Failed to retrieve contact' });
  }
};

// POST /api/contacts
export const createContact = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id!;
    const { name, email, phone, city, company, tags, ...customFields } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Check duplicate email
    const duplicateEmail = await prisma.contact.findFirst({
      where: { userId, email },
    });
    if (duplicateEmail) {
      return res.status(400).json({ error: 'A contact with this email already exists' });
    }

    // Check duplicate phone if provided
    if (phone) {
      const duplicatePhone = await prisma.contact.findFirst({
        where: { userId, phone },
      });
      if (duplicatePhone) {
        return res.status(400).json({ error: 'A contact with this phone number already exists' });
      }
    }

    const contact = await prisma.contact.create({
      data: {
        userId,
        name,
        email,
        phone: phone || null,
        city: city || null,
        company: company || null,
        tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
        customFields: customFields || {},
      },
    });

    return res.status(201).json({ message: 'Contact created successfully', contact });
  } catch (error) {
    console.error('createContact error:', error);
    return res.status(500).json({ error: 'Failed to create contact' });
  }
};

// PUT /api/contacts/:id
export const updateContact = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id!;
    const { id } = req.params;
    const { name, email, phone, city, company, tags, status, ...customFields } = req.body;

    const existingContact = await prisma.contact.findFirst({
      where: { id, userId },
    });

    if (!existingContact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Check duplicate email if it's changing
    if (email && email !== existingContact.email) {
      const duplicateEmail = await prisma.contact.findFirst({
        where: { userId, email },
      });
      if (duplicateEmail) {
        return res.status(400).json({ error: 'A contact with this email already exists' });
      }
    }

    // Check duplicate phone if it's changing
    if (phone && phone !== existingContact.phone) {
      const duplicatePhone = await prisma.contact.findFirst({
        where: { userId, phone },
      });
      if (duplicatePhone) {
        return res.status(400).json({ error: 'A contact with this phone number already exists' });
      }
    }

    // Merge custom fields
    const mergedCustomFields = {
      ...(existingContact.customFields as object),
      ...customFields,
    };

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingContact.name,
        email: email !== undefined ? email : existingContact.email,
        phone: phone !== undefined ? phone : existingContact.phone,
        city: city !== undefined ? city : existingContact.city,
        company: company !== undefined ? company : existingContact.company,
        tags: tags !== undefined ? (Array.isArray(tags) ? tags : [tags]) : existingContact.tags,
        status: status !== undefined ? status : existingContact.status,
        customFields: mergedCustomFields,
      },
    });

    return res.status(200).json({ message: 'Contact updated successfully', contact });
  } catch (error) {
    console.error('updateContact error:', error);
    return res.status(500).json({ error: 'Failed to update contact' });
  }
};

// DELETE /api/contacts/:id
export const deleteContact = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id!;
    const { id } = req.params;

    const contact = await prisma.contact.findFirst({
      where: { id, userId },
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    await prisma.contact.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('deleteContact error:', error);
    return res.status(500).json({ error: 'Failed to delete contact' });
  }
};

// POST /api/contacts/bulk-delete
export const bulkDeleteContacts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id!;
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'Invalid contact IDs' });
    }

    await prisma.contact.deleteMany({
      where: {
        userId,
        id: { in: ids },
      },
    });

    return res.status(200).json({ message: 'Contacts deleted successfully' });
  } catch (error) {
    console.error('bulkDeleteContacts error:', error);
    return res.status(500).json({ error: 'Failed to delete contacts' });
  }
};

// POST /api/contacts/import
export const importContacts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id!;
    const { contacts, skipDuplicates } = req.body;

    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({ error: 'Invalid contacts payload' });
    }

    let added = 0;
    let updated = 0;
    let skipped = 0;

    for (const rawContact of contacts) {
      const { name, email, phone, city, company, tags, ...customFields } = rawContact;

      if (!email || !name) {
        skipped++;
        continue;
      }

      // Check duplicates
      const existingContact = await prisma.contact.findFirst({
        where: {
          userId,
          OR: [
            { email },
            phone ? { phone } : undefined,
          ].filter(Boolean) as any,
        },
      });

      if (existingContact) {
        if (skipDuplicates) {
          skipped++;
        } else {
          // Merge/update
          await prisma.contact.update({
            where: { id: existingContact.id },
            data: {
              name: name || existingContact.name,
              phone: phone || existingContact.phone,
              city: city || existingContact.city,
              company: company || existingContact.company,
              tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim())) : existingContact.tags,
              customFields: {
                ...(existingContact.customFields as object),
                ...customFields,
              },
            },
          });
          updated++;
        }
      } else {
        // Create new
        await prisma.contact.create({
          data: {
            userId,
            name,
            email,
            phone: phone || null,
            city: city || null,
            company: company || null,
            tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim())) : [],
            customFields: customFields || {},
          },
        });
        added++;
      }
    }

    return res.status(200).json({
      message: 'Import completed',
      added,
      updated,
      skipped,
    });
  } catch (error) {
    console.error('importContacts error:', error);
    return res.status(500).json({ error: 'Failed to import contacts' });
  }
};

// GET /api/contacts/export
export const exportContacts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id!;

    const contacts = await prisma.contact.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });

    let csvContent = 'name,email,phone,city,company,tags,jobTitle,industry,leadScore\n';
    for (const contact of contacts) {
      const custom: any = contact.customFields || {};
      const jobTitle = custom.jobTitle || '';
      const industry = custom.industry || '';
      const leadScore = custom.leadScore || '';
      const tagsStr = contact.tags.join(';');

      const row = [
        contact.name,
        contact.email,
        contact.phone || '',
        contact.city || '',
        contact.company || '',
        tagsStr,
        jobTitle,
        industry,
        leadScore,
      ]
        .map((val) => `"${val.toString().replace(/"/g, '""')}"`)
        .join(',');

      csvContent += row + '\n';
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="contacts.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('exportContacts error:', error);
    return res.status(500).json({ error: 'Failed to export contacts' });
  }
};

// POST /api/contacts/lookup-recipients
export const lookupRecipients = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id!;
    const { recipients } = req.body;

    if (!recipients || !Array.isArray(recipients)) {
      return res.status(400).json({ error: 'Recipients list is required' });
    }

    const results = [];
    for (const item of recipients) {
      const trimmed = item.trim();
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
      const isPhone = /^\+?[1-9]\d{1,14}$/.test(trimmed.replace(/[\s()-]/g, ''));

      if (!isEmail && !isPhone) {
        results.push({
          email: item,
          name: '—',
          status: 'Invalid Format',
        });
        continue;
      }

      const contact = await prisma.contact.findFirst({
        where: {
          userId,
          OR: [
            isEmail ? { email: trimmed } : undefined,
            isPhone ? { phone: trimmed } : undefined,
          ].filter(Boolean) as any,
        },
      });

      if (contact) {
        results.push({
          email: item,
          name: contact.name,
          status: 'Found',
        });
      } else {
        results.push({
          email: item,
          name: 'Unknown',
          status: 'Not Found',
        });
      }
    }

    return res.status(200).json({ results });
  } catch (error) {
    console.error('lookupRecipients error:', error);
    return res.status(500).json({ error: 'Failed to lookup recipients' });
  }
};
