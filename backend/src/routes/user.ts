import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { jwt, sign, verify } from 'hono/jwt'
import { bodyLimit } from 'hono/body-limit'

export const userRouter = new Hono<{
    Bindings: {
      DATABASE_URL: string
      JWT_SECRET: string
    }
  }>()

userRouter.post('/signup', async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  
    try{
      const user = await prisma.user.create({
        data: {
          email: body.email,
          password: body.password,
          name: body.name
        }
      })
  
      const token = await sign({id: user.id}, c.env.JWT_SECRET);
  
      return c.json({
        jwt: token
      });
    } catch(e) {
      c.status(403);
      return c.json({error:"error while signing up"});;
    }
  })
  
  userRouter.post('/signin', async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  
    try {
      const user = await prisma.user.findFirst({
        where: {
          email: body.email,
          password: body.password
        }
      })
      if (!user) {
        c.status(403);
        return c.json({
          message: "Incorrect creds"
        })
      }
      const jwt = await sign({
        id: user.id
      }, c.env.JWT_SECRET);
      return c.json({
        jwt: jwt
      })
    }catch(e) {
      c.status(411);
      return c.json({error:"Invalid"})
    }
  })