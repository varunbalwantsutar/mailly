import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import prisma from '../config/db.js';

// Rule matcher helper
export const matchContactWithRules = (contact: any, rules: any[], logicalOperator: string): boolean => {
  if (!rules || rules.length === 0) return true;

  const matches = rules.map((rule) => {
    const { field, operator, value } = rule;
    if (!field || !operator) return true;

    // Resolve field value on contact
    let contactVal: any = undefined;
    const lowerField = field.toLowerCase();
    
    if (lowerField === 'name') contactVal = contact.name;
    else if (lowerField === 'email') contactVal = contact.email;
    else if (lowerField === 'phone') contactVal = contact.phone;
    else if (lowerField === 'city') contactVal = contact.city;
    else if (lowerField === 'company') contactVal = contact.company;
    else if (lowerField === 'tags' || lowerField === 'tag') contactVal = contact.tags;
    else {
      // Look inside customFields
      contactVal = contact.customFields?.[field] ?? contact.customFields?.[lowerField];
    }

    if (contactVal === undefined || contactVal === null) {
      return false;
    }

    const valStr = String(value).toLowerCase();

    // If contact value is an array (tags)
    if (Array.isArray(contactVal)) {
      const arrLower = contactVal.map(t => String(t).toLowerCase());
      if (operator === 'equals') {
        return arrLower.includes(valStr);
      }
      if (operator === 'contains') {
        return arrLower.some(t => t.includes(valStr));
      }
      if (operator === 'not equals' || operator === 'not_equals') {
        return !arrLower.includes(valStr);
      }
      return false;
    }

    const contactValStr = String(contactVal).toLowerCase();

    if (operator === 'equals') {
      return contactValStr === valStr;
    }
    if (operator === 'contains') {
      return contactValStr.includes(valStr);
    }
    if (operator === 'starts with' || operator === 'starts_with') {
      return contactValStr.startsWith(valStr);
    }
    if (operator === 'ends with' || operator === 'ends_with') {
      return contactValStr.endsWith(valStr);
    }
    if (operator === 'greater than' || operator === 'greater_than') {
      return Number(contactVal) > Number(value);
    }
    if (operator === 'less than' || operator === 'less_than') {
      return Number(contactVal) < Number(value);
    }

    return false;
  });

  if (logicalOperator === 'OR') {
    return matches.some(m => m === true);
  } else {
    return matches.every(m => m === true);
  }
};

// GET /api/audiences
export const getAudiences = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id!;

    // Load audiences and all contacts
    const [audiences, contacts] = await Promise.all([
      prisma.audience.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contact.findMany({
        where: { userId, status: 'ACTIVE' },
      }),
    ]);

    // Calculate count dynamically for each audience
    const result = audiences.map((aud) => {
      const rules = aud.rules as any[];
      const matched = contacts.filter((c) =>
        matchContactWithRules(c, rules, aud.logicalOperator)
      );

      return {
        id: aud.id,
        name: aud.name,
        type: aud.type,
        logicalOperator: aud.logicalOperator,
        rules,
        count: matched.length,
        created: new Date(aud.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }),
        lastSync: 'Just now',
      };
    });

    return res.status(200).json({ audiences: result });
  } catch (error) {
    console.error('getAudiences error:', error);
    return res.status(500).json({ error: 'Failed to retrieve audiences' });
  }
};

// GET /api/audiences/:id
export const getAudienceById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id!;
    const { id } = req.params;

    const audience = await prisma.audience.findFirst({
      where: { id, userId },
    });

    if (!audience) {
      return res.status(404).json({ error: 'Audience not found' });
    }

    const contacts = await prisma.contact.findMany({
      where: { userId, status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });

    const rules = audience.rules as any[];
    const matchedContacts = contacts.filter((c) =>
      matchContactWithRules(c, rules, audience.logicalOperator)
    );

    const formattedContacts = matchedContacts.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      location: c.city ? `${c.city}, USA` : 'Unknown',
      tags: c.tags,
      activityText: 'Active',
      activityPercent: 100,
      avatarUrl: (c as any).avatarUrl || undefined,
      initials: c.name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2),
    }));

    return res.status(200).json({
      audience: {
        id: audience.id,
        name: audience.name,
        type: audience.type,
        logicalOperator: audience.logicalOperator,
        rules,
        contactsCount: matchedContacts.length,
        createdDate: new Date(audience.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }),
        lastUpdated: 'Just now',
        filters: rules.map((r) => ({
          label: `${r.field} ${r.operator} ${r.value}`,
          iconType: r.field.toLowerCase() === 'tag' ? 'tag' : 'history',
        })),
        contacts: formattedContacts,
      },
    });
  } catch (error) {
    console.error('getAudienceById error:', error);
    return res.status(500).json({ error: 'Failed to retrieve audience details' });
  }
};

// POST /api/audiences
export const createAudience = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id!;
    const { name, type, logicalOperator, rules } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Audience name is required' });
    }

    const existing = await prisma.audience.findFirst({
      where: { userId, name },
    });

    if (existing) {
      return res.status(400).json({ error: 'An audience with this name already exists' });
    }

    const audience = await prisma.audience.create({
      data: {
        userId,
        name,
        type: type || 'Dynamic Segment',
        logicalOperator: logicalOperator || 'AND',
        rules: rules || [],
      },
    });

    return res.status(201).json({ message: 'Audience created successfully', audience });
  } catch (error) {
    console.error('createAudience error:', error);
    return res.status(500).json({ error: 'Failed to create audience' });
  }
};

// DELETE /api/audiences/:id
export const deleteAudience = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id!;
    const { id } = req.params;

    const audience = await prisma.audience.findFirst({
      where: { id, userId },
    });

    if (!audience) {
      return res.status(404).json({ error: 'Audience not found' });
    }

    await prisma.audience.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Audience deleted successfully' });
  } catch (error) {
    console.error('deleteAudience error:', error);
    return res.status(500).json({ error: 'Failed to delete audience' });
  }
};
