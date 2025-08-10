# FeathersUp.ai

The one stop solution for a contextual Intelligence Platform.

We eliminate the productivity killer that costs support teams millions: context switching. While other platforms focus on automating customer interactions, we solve the human agent problem - the fact that support reps waste 4+ hours per week jumping between systems, re-reading tickets, and losing their train of thought. Our Context Continuity Engine instantly assembles everything an agent needs (past resolutions, customer data, product docs, and activity logs) into one unified view, maintains their mental state during interruptions, and enables seamless handoffs. We don't replace human agents - we make them superhuman by giving them perfect memory and instant context, turning your support team into resolution machines.

## 🏗️ Project Structure

```
FeathersUp.ai/
├── ticketing-system/     # Backend ticketing system
│   ├── src/              # Source code
│   ├── package.json      # Dependencies
│   ├── docker-compose.yml # Database setup
│   └── README.md         # Ticketing system documentation
├── .gitignore            # Git ignore rules
├── LICENSE               # Project license
└── README.md             # This file
```

## 🚀 Getting Started

### Ticketing System Backend

The ticketing system is located in the `ticketing-system/` folder. This is a robust backend built with Node.js, Express, and PostgreSQL.

**Quick Start:**
```bash
cd ticketing-system
./setup.sh
npm run dev
```

For detailed setup instructions, see [ticketing-system/README.md](ticketing-system/README.md).

## 🔧 Development

Each subproject in FeathersUp.ai is self-contained with its own:
- Dependencies and package management
- Configuration files
- Documentation
- Development scripts

## 📄 License

This project is licensed under the Apache License - see the [LICENSE](LICENSE) file for details. 

## Learnings

- https://learnings-while-building-feathersupai.hashnode.space/default-guide/orm-models-migrations-and-seeding-with-sequelize

## Database Relationships

Customer Relationships:
Customer → Tickets (1:Many) - customerId foreign key

2. Agent Relationships:
Agent → Tickets (1:Many) - assignedTo foreign key (assigned tickets)

3. Ticket Relationships:
Ticket → Customer (Many:1) - customerId foreign key
Ticket → Agent (Many:1) - assignedTo foreign key (can be null)
Ticket → Category (Many:1) - categoryId foreign key (can be null)
Ticket → Comments (1:Many) - ticketId foreign key
Ticket → Attachments (1:Many) - ticketId foreign key

4. Category Relationships:
Category → Tickets (1:Many) - categoryId foreign key

5. Comment Relationships:
Comment → Ticket (Many:1) - ticketId foreign key

6. Attachment Relationships:
Attachment → Ticket (Many:1) - ticketId foreign key
